import { execAsync } from './db.js';

export async function initDb() {
  await execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      clerk_user_id TEXT,
      mobile TEXT,
      dob TEXT,
      gender TEXT,
      profile_pic TEXT,
      is_verified INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS assets (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      category TEXT NOT NULL,
      name TEXT NOT NULL,
      amount DOUBLE PRECISION NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS liabilities (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      category TEXT NOT NULL,
      name TEXT NOT NULL,
      amount DOUBLE PRECISION NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets(user_id);
    CREATE INDEX IF NOT EXISTS idx_liabilities_user_id ON liabilities(user_id);
  `);

  await execAsync(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS clerk_user_id TEXT;
  `);

  await execAsync(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_clerk_user_id
    ON users(clerk_user_id)
    WHERE clerk_user_id IS NOT NULL;
  `);
}
