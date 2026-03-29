import { getAsync } from '../config/db.js';

export function getUserByEmail(email) {
  return getAsync('SELECT * FROM users WHERE email = $1', [email]);
}

export function getUserByClerkUserId(clerkUserId) {
  return getAsync('SELECT * FROM users WHERE clerk_user_id = $1', [clerkUserId]);
}

export function getUserById(id) {
  return getAsync('SELECT * FROM users WHERE id = $1', [id]);
}

export async function createUser({
  name,
  email,
  passwordHash,
  clerkUserId = null,
  mobile = null,
  dob = null,
  gender = null,
  profilePic = null,
  isVerified = 0,
  createdAt,
}) {
  return getAsync(
    `INSERT INTO users
      (name, email, password_hash, clerk_user_id, mobile, dob, gender, profile_pic, is_verified, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING *`,
    [
      name,
      email,
      passwordHash,
      clerkUserId,
      mobile,
      dob,
      gender,
      profilePic,
      isVerified,
      createdAt,
    ]
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
  { mobile, dob, gender, profilePic }
) {
  return getAsync(
    `UPDATE users
     SET mobile = $1, dob = $2, gender = $3, profile_pic = $4
     WHERE id = $5
     RETURNING *`,
    [mobile, dob, gender, profilePic, id]
  );
}

export async function updateUserPassword(id, passwordHash) {
  return getAsync(
    'UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING *',
    [passwordHash, id]
  );
}

export async function syncClerkIdentity(
  id,
  { clerkUserId, name, email, isVerified, profilePic }
) {
  return getAsync(
    `UPDATE users
     SET clerk_user_id = $1,
         name = $2,
         email = $3,
         is_verified = $4,
         profile_pic = COALESCE(profile_pic, $5)
     WHERE id = $6
     RETURNING *`,
    [clerkUserId, name, email, isVerified, profilePic, id]
  );
}
