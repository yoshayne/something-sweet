#!/usr/bin/env node
// Upload the rescued images (./rescued/gallery/* and ./rescued/site/*) to the
// Railway bucket, preserving their key paths so the seeded r2_key values resolve.
//
// Skips ./rescued/public/* by default (those are reference screenshots, not
// site-served assets). Pass --include-public to upload them too.
//
// Usage: node scripts/upload-images.mjs [--include-public]

import "dotenv/config";
import { readdirSync, statSync, readFileSync, existsSync } from "node:fs";
import { resolve, dirname, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const RESCUED = resolve(root, "rescued");
const includePublic = process.argv.includes("--include-public");

if (!existsSync(RESCUED)) {
  console.error("No ./rescued directory. Run: node scripts/rescue-images.mjs first.");
  process.exit(1);
}

const s3 = new S3Client({
  endpoint: process.env.BUCKET_ENDPOINT_URL || process.env.BUCKET_ENDPOINT,
  region: process.env.BUCKET_DEFAULT_REGION || process.env.BUCKET_REGION || "auto",
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.BUCKET_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.BUCKET_SECRET_ACCESS_KEY || "",
  },
});
const BUCKET = process.env.BUCKET_NAME || "";

const CONTENT_TYPES = {
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
};

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = resolve(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const files = walk(RESCUED);
let ok = 0;
let fail = 0;

for (const file of files) {
  const key = relative(RESCUED, file).split(sep).join("/");
  if (!includePublic && key.startsWith("public/")) continue;

  const ext = key.split(".").pop()?.toLowerCase();
  const ContentType = CONTENT_TYPES[ext] || "application/octet-stream";
  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: readFileSync(file),
        ContentType,
      }),
    );
    await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    console.log(`uploaded ${key}`);
    ok++;
  } catch (err) {
    console.error(`FAIL ${key}: ${err.message}`);
    fail++;
  }
}

console.log(`\nDone. ${ok} uploaded, ${fail} failed.`);
