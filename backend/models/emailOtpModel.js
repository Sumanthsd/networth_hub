import { getAsync, runAsync } from '../config/db.js';

export async function clearOtpsForUser(userId, purpose) {
  await runAsync('DELETE FROM email_otps WHERE user_id = ? AND purpose = ?', [
    userId,
    purpose,
  ]);
}

export async function createEmailOtp({
  userId,
  otpHash,
  purpose,
  expiresAt,
  createdAt,
}) {
  const result = await runAsync(
    `INSERT INTO email_otps (user_id, otp_hash, purpose, expires_at, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, otpHash, purpose, expiresAt, createdAt]
  );
  return getAsync('SELECT * FROM email_otps WHERE id = ?', [result.lastID]);
}

export function getLatestOtpForUser(userId, purpose) {
  return getAsync(
    `SELECT * FROM email_otps
     WHERE user_id = ? AND purpose = ?
     ORDER BY id DESC
     LIMIT 1`,
    [userId, purpose]
  );
}

export async function deleteExpiredOtps() {
  await runAsync('DELETE FROM email_otps WHERE expires_at < ?', [
    new Date().toISOString(),
  ]);
}

export async function deleteOtpsForUser(userId, purpose) {
  await runAsync('DELETE FROM email_otps WHERE user_id = ? AND purpose = ?', [
    userId,
    purpose,
  ]);
}
