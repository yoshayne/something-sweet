import "dotenv/config";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import app from "../worker/index"; // the existing Hono app (default export, routes already registered)

const DIST = resolve(process.cwd(), "dist");

// Serve built static assets (hashed JS/CSS/images live under dist/assets).
// API routes were registered on `app` before this point, so Hono matches them first.
app.use("/assets/*", serveStatic({ root: "./dist" }));

// Anything Vite copies from /public lands at the dist root (favicon, robots.txt, og image, etc.)
app.use("/favicon.ico", serveStatic({ path: "./dist/favicon.ico" }));
app.use("/apple-touch-icon.png", serveStatic({ path: "./dist/apple-touch-icon.png" }));
app.use("/robots.txt", serveStatic({ path: "./dist/robots.txt" }));
app.use("/og-image.png", serveStatic({ path: "./dist/og-image.png" }));

// SPA fallback: any non-API GET returns index.html so react-router can take over.
const indexHtml = readFileSync(resolve(DIST, "index.html"), "utf-8");
app.get("*", (c) => {
  if (c.req.path.startsWith("/api/")) return c.notFound();
  return c.html(indexHtml);
});

const port = Number(process.env.PORT) || 8080;
serve({ fetch: app.fetch, port }, () => {
  console.log(`Something Sweet by Erica listening on :${port}`);
});
