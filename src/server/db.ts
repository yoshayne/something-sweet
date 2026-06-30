import { Pool, types } from "pg";

// FOOTGUN FIX #1: make NUMERIC/DECIMAL/FLOAT8 come back as JS numbers, not strings.
// (SQLite REAL returned numbers; the frontend does math on totals.)
types.setTypeParser(1700, (v) => (v === null ? null : parseFloat(v))); // numeric
types.setTypeParser(701, (v) => (v === null ? null : parseFloat(v))); // float8
// FOOTGUN FIX #2: bigint (e.g. COUNT(*)) is returned as a string by pg by
// default; SQLite returned a JS number. Counts here are tiny, so parse int8 to
// number to keep the /api/orders/stats response shape identical to D1.
types.setTypeParser(20, (v) => (v === null ? null : parseInt(v, 10))); // int8

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.DATABASE_URL?.includes("railway") ||
    process.env.PGSSLMODE === "require"
      ? { rejectUnauthorized: false }
      : undefined,
});

// Convert "?, ?, ?" -> "$1, $2, $3"
function toPg(sql: string): string {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

class Statement {
  private params: unknown[] = [];
  constructor(private sql: string) {}

  bind(...args: unknown[]) {
    this.params = args;
    return this;
  }

  async first<T = Record<string, unknown>>(): Promise<T | null> {
    const { rows } = await pool.query(toPg(this.sql), this.params as unknown[]);
    return (rows[0] as T) ?? null;
  }

  async all<T = Record<string, unknown>>(): Promise<{ results: T[] }> {
    const { rows } = await pool.query(toPg(this.sql), this.params as unknown[]);
    return { results: rows as T[] };
  }

  async run(): Promise<{ success: boolean; meta: { last_row_id?: number; changes: number } }> {
    let sql = this.sql;
    const isInsert = /^\s*insert\s/i.test(sql);
    // Auto-append RETURNING id for inserts so `result.meta.last_row_id` works
    // the way the D1 routes expect. Safe for `ON CONFLICT ... DO NOTHING/UPDATE`.
    if (isInsert && !/returning/i.test(sql)) {
      sql = sql.trim().replace(/;?\s*$/, "") + " RETURNING id";
    }
    const res = await pool.query(toPg(sql), this.params as unknown[]);
    return {
      success: true,
      meta: { last_row_id: res.rows[0]?.id, changes: res.rowCount ?? 0 },
    };
  }
}

// Drop-in replacement for the D1 binding (c.env.DB)
export const DB = {
  prepare(sql: string) {
    return new Statement(sql);
  },
};
