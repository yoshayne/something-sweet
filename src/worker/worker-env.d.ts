// Ambient binding types for the Hono worker.
//
// On Cloudflare these came from the wrangler-generated `worker-configuration.d.ts`.
// On Node/Railway the same `c.env.*` shape is provided at runtime by the
// drop-in shims in `src/server/{db,bucket,email}.ts`, attached via middleware.
// These declarations only describe the subset of the D1/R2/EMAILS APIs the
// routes actually use, so the existing route bodies type-check unchanged.

interface D1PreparedStatement {
  bind(...args: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
  run(): Promise<{ success: boolean; meta: { last_row_id?: number; changes: number } }>;
}

interface D1Database {
  prepare(sql: string): D1PreparedStatement;
}

interface R2ObjectBody {
  // Buffer at runtime on Node; ReadableStream on Cloudflare. Kept permissive
  // so `new Response(object.body)` / `c.body(object.body)` type-check.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any;
  size: number;
  httpEtag: string;
  httpMetadata?: { contentType?: string };
  writeHttpMetadata(headers: Headers): void;
  arrayBuffer(): Promise<ArrayBuffer | Uint8Array>;
}

interface R2PutOptions {
  httpMetadata?: { contentType?: string };
}

interface R2Bucket {
  put(
    key: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body: ArrayBuffer | Uint8Array | Blob | File | ReadableStream | any,
    options?: R2PutOptions,
  ): Promise<{ key: string } | null>;
  get(key: string): Promise<R2ObjectBody | null>;
  head(key: string): Promise<{ size: number; httpEtag: string } | null>;
  delete(key: string): Promise<void>;
}

interface EmailParams {
  to: string;
  subject: string;
  html_body?: string;
  text_body?: string;
  reply_to?: string;
  customer_id?: string;
  broadcast?: boolean;
}

interface EmailResult {
  success: boolean;
  message_id?: string;
  error?: string;
}

interface EmailService {
  send(params: EmailParams): Promise<EmailResult>;
}

interface Env {
  DB: D1Database;
  R2_BUCKET: R2Bucket;
  EMAILS: EmailService;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
}
