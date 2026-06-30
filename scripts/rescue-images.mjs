#!/usr/bin/env node
// TIME-SENSITIVE: download the live image bytes from the Mocha site before it
// shuts down (Aug 1 2026), preserving their R2 key paths so the seeded
// `r2_key` values keep resolving after upload to the Railway bucket.
//
// Reads gallery/ and site/ keys from d1_dump.sql, downloads each via the live
// proxy routes, and writes them to ./rescued/<r2_key>. Also fetches the public
// assets in public_asset_links.json into ./rescued/public/.
//
// Step 2 (after this): node scripts/upload-images.mjs  — uploads ./rescued/* to the bucket.
//
// Usage: node scripts/rescue-images.mjs [liveBaseUrl]
//   liveBaseUrl defaults to https://somethingsweet.mocha.app

import { readFileSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const LIVE = (process.argv[2] || "https://somethingsweet.mocha.app").replace(/\/$/, "");
const OUT = resolve(root, "rescued");

const dump = readFileSync(resolve(root, "d1_dump.sql"), "utf-8");

const galleryKeys = [...dump.matchAll(/'(gallery\/[^']+)'/g)].map((m) => m[1]);
const siteKeys = [...dump.matchAll(/'(site\/[^']+)'/g)].map((m) => m[1]);
const uniq = (a) => [...new Set(a)];

async function download(url, destKey) {
  const dest = resolve(OUT, destKey);
  if (existsSync(dest)) {
    console.log(`skip (exists): ${destKey}`);
    return true;
  }
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`FAIL ${res.status}: ${url}`);
      return false;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, buf);
    console.log(`saved ${destKey} (${buf.length} bytes)`);
    return true;
  } catch (err) {
    console.error(`ERROR ${url}: ${err.message}`);
    return false;
  }
}

let ok = 0;
let fail = 0;

// gallery/<key> served by /api/gallery/image/<key-after-gallery/>
for (const key of uniq(galleryKeys)) {
  const filename = key.replace(/^gallery\//, "");
  const success = await download(`${LIVE}/api/gallery/image/${filename}`, key);
  success ? ok++ : fail++;
}

// site/<key> served by /api/site-images/image/<key-after-site/>
for (const key of uniq(siteKeys)) {
  const filename = key.replace(/^site\//, "");
  const success = await download(`${LIVE}/api/site-images/image/${filename}`, key);
  success ? ok++ : fail++;
}

// Public assets (OG image, screenshots) referenced in public_asset_links.json
const publicLinksPath = resolve(root, "public_asset_links.json");
if (existsSync(publicLinksPath)) {
  const links = JSON.parse(readFileSync(publicLinksPath, "utf-8"));
  for (const url of links) {
    const name = decodeURIComponent(url.split("/").pop());
    const success = await download(url, `public/${name}`);
    success ? ok++ : fail++;
  }
}

console.log(`\nDone. ${ok} rescued, ${fail} failed. Output: ${OUT}`);
console.log(
  "Next: copy the OG image to public/og-image.png if needed, then run: node scripts/upload-images.mjs",
);
