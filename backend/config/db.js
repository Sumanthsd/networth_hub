import pg from 'pg';

const { Pool } = pg;

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/networth_hub';

export const db = new Pool({
  connectionString,
  ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

export async function runAsync(sql, params = []) {
  const result = await db.query(sql, params);
  return {
    rowCount: result.rowCount,
    rows: result.rows,
  };
}

export async function execAsync(sql) {
  await db.query(sql);
}

export async function allAsync(sql, params = []) {
  const result = await db.query(sql, params);
  return result.rows;
}

export async function getAsync(sql, params = []) {
  const result = await db.query(sql, params);
  return result.rows[0];
}
