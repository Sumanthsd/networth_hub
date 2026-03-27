import { allAsync, getAsync, runAsync } from '../config/db.js';

const TABLE = 'assets';

export async function getAllAssets(userId) {
  return allAsync(
    `SELECT * FROM ${TABLE} WHERE user_id = ? ORDER BY id DESC`,
    [userId]
  );
}

export async function getAssetById(id, userId) {
  return getAsync(`SELECT * FROM ${TABLE} WHERE id = ? AND user_id = ?`, [
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
  const result = await runAsync(
    `INSERT INTO ${TABLE} (user_id, category, name, amount, notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, category, name, amount, notes || null, createdAt]
  );
  return getAssetById(result.lastID, userId);
}

export async function updateAsset(id, userId, { category, name, amount, notes }) {
  await runAsync(
    `UPDATE ${TABLE}
     SET category = ?, name = ?, amount = ?, notes = ?
     WHERE id = ? AND user_id = ?`,
    [category, name, amount, notes || null, id, userId]
  );
  return getAssetById(id, userId);
}

export async function deleteAsset(id, userId) {
  await runAsync(`DELETE FROM ${TABLE} WHERE id = ? AND user_id = ?`, [
    id,
    userId,
  ]);
}

export async function truncateAssets(userId) {
  await runAsync(`DELETE FROM ${TABLE} WHERE user_id = ?`, [userId]);
}

export async function sumAssets(userId) {
  const row = await getAsync(
    `SELECT SUM(amount) as total FROM ${TABLE} WHERE user_id = ?`,
    [userId]
  );
  return row?.total || 0;
}

export async function getAssetAllocationByCategory(userId) {
  return allAsync(
    `SELECT category, SUM(amount) as totalAmount
     FROM ${TABLE}
     WHERE user_id = ?
     GROUP BY category
     ORDER BY totalAmount DESC`,
    [userId]
  );
}

