# Something Sweet by Erica

Custom cakes, cookies & cupcakes site for **Something Sweet by Erica**.

This is the migrated version of the original Mocha/Cloudflare app, rebuilt to
run on the standard stack: **GitHub → Railway, Postgres, Railway bucket storage,
Brevo email, Stripe payments.** The frontend, design, animations, copy, and
admin are unchanged — only the platform plumbing moved.

## Stack

| Concern        | Implementation                                                        |
| -------------- | --------------------------------------------------------------------- |
| Runtime        | Node via `@hono/node-server` (Hono 4.7.7, unchanged)                  |
| Frontend       | React 19 + Vite 7 + react-router 7 + Tailwind 3 + radix-ui            |
| Database       | Postgres (`pg`) behind a D1-compatible shim (`src/server/db.ts`)      |
| File storage   | Railway bucket (S3 API) behind an R2-compatible shim (`bucket.ts`)    |
| Email          | Brevo transactional API behind an `EMAILS`-compatible shim (`email.ts`)|
| Payments       | Stripe (unchanged)                                                    |

The shims attach to `c.env` via one middleware in `src/worker/index.ts`, so the
~60 existing Hono routes run unchanged.

## Project layout

```
src/react-app/   React SPA (unchanged from original)
src/data/        Static gallery / order / seasonal data (unchanged)
src/shared/      Shared types (unchanged)
src/worker/      Hono API app (env middleware + Postgres-portable tweaks)
src/server/      Node entry + db/bucket/email shims
db/              schema.sql (Postgres DDL) + seed.sql (generated from d1_dump.sql)
scripts/         SQL runner, dump converter, image rescue/upload helpers
```

## Local development

```bash
cp .env.example .env       # fill in DATABASE_URL, BUCKET_*, BREVO_*, STRIPE_*
npm install
npm run db:setup           # loads db/schema.sql then db/seed.sql
npm run dev                # tsx watch src/server/index.ts  (serves API + built SPA)
```

For a production-like run: `npm run build && npm run start`.

## Scripts

| Script                  | Purpose                                                            |
| ----------------------- | ------------------------------------------------------------------ |
| `npm run dev`           | Dev server (tsx watch)                                             |
| `npm run build`         | `vite build` + compile server to `build/` (CommonJS)              |
| `npm run start`         | Run the compiled server (`node build/server/index.js`)             |
| `npm run db:setup`      | Load schema then seed into `DATABASE_URL`                          |
| `npm run images:rescue` | Download live images from the Mocha site into `./rescued/`         |
| `npm run images:upload` | Upload `./rescued/*` to the Railway bucket, preserving key paths   |

`db/seed.sql` is generated from `d1_dump.sql` by `node scripts/convert-dump.mjs`.

## Deploying to Railway

1. Push to GitHub; create a Railway project from the repo.
2. Add **Postgres** (provides `DATABASE_URL`) and a **bucket** (provides `BUCKET_*`).
3. Set all variables from `.env.example` in the service.
4. Build: `npm install && npm run build`. Start: `npm run start`.
5. Run `npm run db:setup` once (Railway shell / one-off).
6. Rescue + upload images: `npm run images:rescue` then `npm run images:upload`
   (do this **before** the Mocha site shuts down).
7. Point the custom domain (`somethingsweet.shop`) at the service.
8. In Stripe, add the `/api/webhooks/stripe` endpoint and set `STRIPE_WEBHOOK_SECRET`.

## Known follow-ups

- **Admin is unauthenticated** (`/admin/*` and its API), matching the original.
  Search for `TODO: SECURE ADMIN`.
- **Rotate the Stripe keys** from the old export before go-live.
- **Verify the Brevo sender** before go-live or email lands in spam.
- Re-host the OG image + favicon (referenced from `index.html`).
