#!/usr/bin/env node
// Convert the D1/SQLite export (d1_dump.sql) into Postgres-loadable db/seed.sql.
//
// What it does:
//   * Keeps only the data INSERTs for the 9 application tables (skips
//     _mocha_migrations and sqlite_sequence).
//   * Rewrites SQLite `replace('...\n...','\n',char(10))` wrappers into plain
//     Postgres string literals with real newlines (preserving emoji + doubled
//     single-quote escaping, which Postgres shares with SQLite).
//   * Appends setval() calls so SERIAL sequences continue past the seeded ids.
//
// Usage: node scripts/convert-dump.mjs [inputDump] [outputSeed]

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const input = resolve(root, process.argv[2] || "d1_dump.sql");
const output = resolve(root, process.argv[3] || "db/seed.sql");

const TABLES = [
  "orders",
  "invoices",
  "invoice_items",
  "gallery_images",
  "settings",
  "site_images",
  "page_content",
  "hidden_gallery_items",
  "subscribers",
];

// Unwrap replace('<body>','\n',char(10)) -> '<body-with-real-newlines>'
function unwrapReplace(sql) {
  const re = /replace\('((?:[^']|'')*)','\\n',char\(10\)\)/g;
  return sql.replace(re, (_m, body) => {
    const withNewlines = body.replace(/\\n/g, "\n");
    return `'${withNewlines}'`;
  });
}

const lines = readFileSync(input, "utf-8").split(/\r?\n/);
const inserts = [];

for (const line of lines) {
  const m = line.match(/^INSERT INTO "([^"]+)"/);
  if (!m) continue;
  if (!TABLES.includes(m[1])) continue;
  inserts.push(unwrapReplace(line));
}

// Reset each sequence so new inserts continue past the seeded ids. Use
// GREATEST(...,1) + an is_called flag so empty tables (value 0 would be out of
// range for a SERIAL sequence) start cleanly at 1.
const setvals = TABLES.map(
  (t) =>
    `SELECT setval('${t}_id_seq', GREATEST((SELECT COALESCE(MAX(id),0) FROM ${t}), 1), (SELECT COUNT(*) FROM ${t}) > 0);`,
);

const out = `-- Something Sweet by Erica — Postgres seed data
-- AUTO-GENERATED from d1_dump.sql by scripts/convert-dump.mjs. Do not edit by hand;
-- re-run \`node scripts/convert-dump.mjs\` to regenerate.
--
-- Load order: db/schema.sql first, then this file.

BEGIN;

${inserts.join("\n")}

-- Reset sequences so new inserts continue past the seeded ids.
${setvals.join("\n")}

COMMIT;
`;

writeFileSync(output, out, "utf-8");
console.log(`Wrote ${inserts.length} INSERT rows to ${output}`);
