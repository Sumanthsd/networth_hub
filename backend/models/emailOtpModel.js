import { getAsync, runAsync } from '../config/db.js';

export async function clearOtpsForUser(userId, purpose) {
  await runAsync('DELETE FROM email_otps WHERE user_id = $1 AND purpose = $2', [
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
  return getAsync(
    `INSERT INTO email_otps (user_id, otp_hash, purpose, expires_at, created_at)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, otpHash, purpose, expiresAt, createdAt]
  );
}

export function getLatestOtpForUser(userId, purpose) {
  return getAsync(
    `SELECT * FROM email_otps
     WHERE user_id = $1 AND purpose = $2
     ORDER BY id DESC
     LIMIT 1`,
    [userId, purpose]
  );
}

export async function deleteExpiredOtps() {
  await runAsync('DELETE FROM email_otps WHERE expires_at < $1', [
    new Date().toISOString(),
  ]);
}

export async function deleteOtpsForUser(userId, purpose) {
  await runAsync('DELETE FROM email_otps WHERE user_id = $1 AND purpose = $2', [
    userId,
    purpose,
  ]);
}
