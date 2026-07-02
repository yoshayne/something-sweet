import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

// Railway's bucket exposes BUCKET_ENDPOINT_URL / BUCKET_DEFAULT_REGION; accept
// the shorter aliases too for local dev.
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function streamToBuffer(stream: any): Promise<Buffer> {
  if (!stream) return Buffer.alloc(0);
  // AWS SDK v3 in Node returns a Readable stream
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

// Normalize the many body shapes the routes pass (ArrayBuffer, Uint8Array,
// Buffer, and crucially `File`/`Blob` objects from multipart form-data).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function toBuffer(body: any): Promise<Buffer> {
  if (Buffer.isBuffer(body)) return body;
  if (body instanceof Uint8Array) return Buffer.from(body);
  if (body instanceof ArrayBuffer) return Buffer.from(new Uint8Array(body));
  // File / Blob (Web API) expose arrayBuffer()
  if (body && typeof body.arrayBuffer === "function") {
    const ab = await body.arrayBuffer();
    return Buffer.from(new Uint8Array(ab));
  }
  return Buffer.from(body);
}

// Mimics the R2 object shape the routes expect
function makeR2Object(
  body: Buffer,
  contentType: string | undefined,
  etag: string | undefined,
  size: number,
) {
  return {
    body, // routes call new Response(object.body) / c.body(object.body)
    size,
    httpEtag: etag ? etag.replace(/"/g, "") : "",
    httpMetadata: { contentType: contentType || "application/octet-stream" },
    writeHttpMetadata(headers: Headers) {
      headers.set("content-type", contentType || "application/octet-stream");
    },
    async arrayBuffer() {
      return body;
    },
  };
}

export const R2_BUCKET = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async put(key: string, body: any, opts?: { httpMetadata?: { contentType?: string } }) {
    const buf = await toBuffer(body);
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buf,
        ContentType: opts?.httpMetadata?.contentType,
      }),
    );
    return { key };
  },

  async get(key: string) {
    try {
      const res = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
      const buf = await streamToBuffer(res.Body);
      return makeR2Object(buf, res.ContentType, res.ETag, res.ContentLength ?? buf.length);
    } catch {
      return null; // R2.get returns null when missing; routes check `if (!object)`
    }
  },

  async head(key: string) {
    try {
      const res = await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
      return { size: res.ContentLength ?? 0, httpEtag: (res.ETag || "").replace(/"/g, "") };
    } catch {
      return null;
    }
  },

  async delete(key: string) {
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
  },
};
