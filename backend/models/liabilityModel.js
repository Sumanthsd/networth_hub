import { allAsync, getAsync, runAsync } from '../config/db.js';

const TABLE = 'liabilities';

export async function getAllLiabilities(userId) {
  return allAsync(
    `SELECT * FROM ${TABLE} WHERE user_id = ? ORDER BY id DESC`,
    [userId]
  );
}

export async function getLiabilityById(id, userId) {
  return getAsync(`SELECT * FROM ${TABLE} WHERE id = ? AND user_id = ?`, [
    id,
    userId,
  ]);
}

export async function createLiability({
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
  return getLiabilityById(result.lastID, userId);
}

export async function updateLiability(
  id,
  userId,
  { category, name, amount, notes }
) {
  await runAsync(
    `UPDATE ${TABLE}
     SET category = ?, name = ?, amount = ?, notes = ?
     WHERE id = ? AND user_id = ?`,
    [category, name, amount, notes || null, id, userId]
  );
  return getLiabilityById(id, userId);
}

export async function deleteLiability(id, userId) {
  await runAsync(`DELETE FROM ${TABLE} WHERE id = ? AND user_id = ?`, [
    id,
    userId,
  ]);
}

export async function truncateLiabilities(userId) {
  await runAsync(`DELETE FROM ${TABLE} WHERE user_id = ?`, [userId]);
}

export async function sumLiabilities(userId) {
  const row = await getAsync(
    `SELECT SUM(amount) as total FROM ${TABLE} WHERE user_id = ?`,
    [userId]
  );
  return row?.total || 0;
}

