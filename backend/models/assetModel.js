import { allAsync, getAsync, runAsync } from '../config/db.js';

const TABLE = 'assets';

export async function getAllAssets(userId) {
  return allAsync(
    `SELECT * FROM ${TABLE} WHERE user_id = $1 ORDER BY id DESC`,
    [userId]
  );
}

export async function getAssetById(id, userId) {
  return getAsync(`SELECT * FROM ${TABLE} WHERE id = $1 AND user_id = $2`, [
    id,
    userId,
  ]);
}

export async function createAsset({
  userId,
  category,
  name,
  amount,
  notes,
  createdAt,
}) {
  return getAsync(
    `INSERT INTO ${TABLE} (user_id, category, name, amount, notes, created_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [userId, category, name, amount, notes || null, createdAt]
  );
}

export async function updateAsset(id, userId, { category, name, amount, notes }) {
  return getAsync(
    `UPDATE ${TABLE}
     SET category = $1, name = $2, amount = $3, notes = $4
     WHERE id = $5 AND user_id = $6
     RETURNING *`,
    [category, name, amount, notes || null, id, userId]
  );
}

export async function deleteAsset(id, userId) {
  await runAsync(`DELETE FROM ${TABLE} WHERE id = $1 AND user_id = $2`, [
    id,
    userId,
  ]);
}

export async function truncateAssets(userId) {
  await runAsync(`DELETE FROM ${TABLE} WHERE user_id = $1`, [userId]);
}

export async function sumAssets(userId) {
  const row = await getAsync(
    `SELECT COALESCE(SUM(amount), 0) AS total FROM ${TABLE} WHERE user_id = $1`,
    [userId]
  );
  return Number(row?.total || 0);
}

export async function getAssetAllocationByCategory(userId) {
  return allAsync(
    `SELECT category, SUM(amount) as "totalAmount"
     FROM ${TABLE}
     WHERE user_id = $1
     GROUP BY category
     ORDER BY "totalAmount" DESC`,
    [userId]
  );
}
