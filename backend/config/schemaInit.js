import { allAsync, runAsync } from './db.js';

async function ensureColumn(tableName, columnName, definition) {
  const columns = await allAsync(`PRAGMA table_info(${tableName})`);
  const hasColumn = columns.some((column) => column.name === columnName);
  if (!hasColumn) {
    await runAsync(
      `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`
    );
  }
}

export async function initDb() {
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      is_verified INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `;

  const createEmailOtpsTable = `
    CREATE TABLE IF NOT EXISTS email_otps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      otp_hash TEXT NOT NULL,
      purpose TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `;

  const createAssetsTable = `
    CREATE TABLE IF NOT EXISTS assets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      category TEXT NOT NULL,
      name TEXT NOT NULL,
      amount REAL NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL
    );
  `;

  const createLiabilitiesTable = `
    CREATE TABLE IF NOT EXISTS liabilities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      category TEXT NOT NULL,
      name TEXT NOT NULL,
      amount REAL NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL
    );
  `;

  await runAsync(createUsersTable);
  await runAsync(createEmailOtpsTable);
  await runAsync(createAssetsTable);
  await runAsync(createLiabilitiesTable);
  await ensureColumn('users', 'mobile', 'TEXT');
  await ensureColumn('users', 'dob', 'TEXT');
  await ensureColumn('users', 'gender', 'TEXT');
  await ensureColumn('users', 'profile_pic', 'TEXT');
  await ensureColumn('assets', 'user_id', 'INTEGER');
  await ensureColumn('liabilities', 'user_id', 'INTEGER');
  await runAsync(
    'CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets(user_id)'
  );
  await runAsync(
    'CREATE INDEX IF NOT EXISTS idx_liabilities_user_id ON liabilities(user_id)'
  );
  await runAsync(
    'CREATE INDEX IF NOT EXISTS idx_email_otps_user_purpose ON email_otps(user_id, purpose)'
  );
}

