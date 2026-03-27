import { getAsync } from '../config/db.js';

export function getUserByEmail(email) {
  return getAsync('SELECT * FROM users WHERE email = $1', [email]);
}

export function getUserById(id) {
  return getAsync('SELECT * FROM users WHERE id = $1', [id]);
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
  return getAsync(
    `INSERT INTO users
      (name, email, password_hash, mobile, dob, gender, profile_pic, is_verified, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING *`,
    [name, email, passwordHash, mobile, dob, gender, profilePic, isVerified, createdAt]
  );
}

export async function updateUnverifiedUser(id, { name, passwordHash }) {
  return getAsync(
    `UPDATE users
     SET name = $1, password_hash = $2, is_verified = 0
     WHERE id = $3
     RETURNING *`,
    [name, passwordHash, id]
  );
}

export async function markUserVerified(id) {
  return getAsync(
    'UPDATE users SET is_verified = 1 WHERE id = $1 RETURNING *',
    [id]
  );
}

export async function updateUserProfile(
  id,
  { name, email, mobile, dob, gender, profilePic }
) {
  return getAsync(
    `UPDATE users
     SET name = $1, email = $2, mobile = $3, dob = $4, gender = $5, profile_pic = $6
     WHERE id = $7
     RETURNING *`,
    [name, email, mobile, dob, gender, profilePic, id]
  );
}

export async function updateUserPassword(id, passwordHash) {
  return getAsync(
    'UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING *',
    [passwordHash, id]
  );
}
