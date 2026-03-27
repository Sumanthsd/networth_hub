import { getAsync, runAsync } from '../config/db.js';

export function getUserByEmail(email) {
  return getAsync('SELECT * FROM users WHERE email = ?', [email]);
}

export function getUserById(id) {
  return getAsync('SELECT * FROM users WHERE id = ?', [id]);
}

export async function createUser({
  name,
  email,
  passwordHash,
  mobile = null,
  dob = null,
  gender = null,
  profilePic = null,
  isVerified = 0,
  createdAt,
}) {
  const result = await runAsync(
    `INSERT INTO users (
      name,
      email,
      password_hash,
      mobile,
      dob,
      gender,
      profile_pic,
      is_verified,
      created_at
    )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, email, passwordHash, mobile, dob, gender, profilePic, isVerified, createdAt]
  );
  return getUserById(result.lastID);
}

export async function updateUnverifiedUser(id, { name, passwordHash }) {
  await runAsync(
    `UPDATE users
     SET name = ?, password_hash = ?, is_verified = 0
     WHERE id = ?`,
    [name, passwordHash, id]
  );
  return getUserById(id);
}

export async function markUserVerified(id) {
  await runAsync('UPDATE users SET is_verified = 1 WHERE id = ?', [id]);
  return getUserById(id);
}

export async function updateUserProfile(
  id,
  { name, email, mobile, dob, gender, profilePic }
) {
  await runAsync(
    `UPDATE users
     SET name = ?, email = ?, mobile = ?, dob = ?, gender = ?, profile_pic = ?
     WHERE id = ?`,
    [name, email, mobile, dob, gender, profilePic, id]
  );
  return getUserById(id);
}

export async function updateUserPassword(id, passwordHash) {
  await runAsync('UPDATE users SET password_hash = ? WHERE id = ?', [
    passwordHash,
    id,
  ]);
  return getUserById(id);
}
