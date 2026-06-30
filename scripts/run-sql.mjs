#!/usr/bin/env node
// Pipe a .sql file through pg against DATABASE_URL.
// Usage: node scripts/run-sql.mjs db/schema.sql
import "dotenv/config";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import pg from "pg";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/run-sql.mjs <path-to.sql>");
  process.exit(1);
}

const sql = readFileSync(resolve(process.cwd(), file), "utf-8");

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.DATABASE_URL?.includes("railway") ||
    process.env.PGSSLMODE === "require"
      ? { rejectUnauthorized: false }
      : undefined,
});

try {
  await client.connect();
  await client.query(sql);
  console.log(`Executed ${file}`);
} catch (err) {
  console.error(`Failed executing ${file}:`, err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
