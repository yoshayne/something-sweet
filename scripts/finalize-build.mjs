#!/usr/bin/env node
// The server is compiled to CommonJS (tsconfig.server.json) but the root
// package.json declares "type": "module", so Node would treat build/*.js as ESM.
// Drop a package.json into build/ marking it CommonJS so `node build/server/index.js`
// runs the compiled output correctly. (Owner's proven Railway pattern.)
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const buildDir = resolve(process.cwd(), "build");
mkdirSync(buildDir, { recursive: true });
writeFileSync(resolve(buildDir, "package.json"), JSON.stringify({ type: "commonjs" }, null, 2));
console.log("Wrote build/package.json ({ type: commonjs })");
