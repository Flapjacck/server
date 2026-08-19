import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const INIT_SQL = `
  CREATE TABLE IF NOT EXISTS strings (
    id SERIAL PRIMARY KEY,
    value TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
`;

export async function initDb(): Promise<void> {
  const maxAttempts = 10;
  const delayMs = 2000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await pool.query(INIT_SQL);
      return;
    } catch (err) {
      if (attempt === maxAttempts) {
        throw err;
      }
      console.log(`DB not ready (attempt ${attempt}/${maxAttempts}), retrying...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

export type StringRow = {
  id: number;
  value: string;
  created_at: Date;
};

export async function insertString(value: string): Promise<StringRow> {
  const result = await pool.query<StringRow>(
    "INSERT INTO strings (value) VALUES ($1) RETURNING id, value, created_at",
    [value]
  );
  return result.rows[0];
}

export async function listStrings(): Promise<StringRow[]> {
  const result = await pool.query<StringRow>(
    "SELECT id, value, created_at FROM strings ORDER BY id DESC LIMIT 200"
  );
  return result.rows;
}

export { pool };
