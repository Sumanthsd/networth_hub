import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import {
  createUser,
  getUserByEmail,
  getUserById,
  markUserVerified,
  updateUserPassword,
  updateUserProfile,
  updateUnverifiedUser,
} from '../models/userModel.js';
import {
  clearOtpsForUser,
  createEmailOtp,
  deleteExpiredOtps,
  deleteOtpsForUser,
  getLatestOtpForUser,
} from '../models/emailOtpModel.js';
import { sendSignupOtpEmail } from './mailService.js';

const OTP_PURPOSE = 'signup';
const OTP_TTL_MINUTES = 10;

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function createError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function hashOtp(otp) {
  return crypto.createHash('sha256').update(String(otp)).digest('hex');
}

function getJwtSecret() {
  return process.env.JWT_SECRET || 'dev-networth-secret-change-me';
}

function createToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
    },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    mobile: user.mobile || '',
    dob: user.dob || '',
    gender: user.gender || '',
    profilePic: user.profile_pic || '',
    isVerified: Boolean(user.is_verified),
    createdAt: user.created_at,
  };
}

async function issueSignupOtp(user) {
  const otp = generateOtp();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + OTP_TTL_MINUTES * 60 * 1000);

  await clearOtpsForUser(user.id, OTP_PURPOSE);
  await createEmailOtp({
    userId: user.id,
    otpHash: hashOtp(otp),
    purpose: OTP_PURPOSE,
    expiresAt: expiresAt.toISOString(),
    createdAt: now.toISOString(),
  });

  const delivery = await sendSignupOtpEmail({
    email: user.email,
    name: user.name,
    otp,
  });

  return {
    message: delivery.delivered
      ? 'Verification code sent to your email.'
      : 'Verification code generated. Email delivery is not configured, so check backend logs in development.',
    delivered: delivery.delivered,
  };
}

export async function registerUser({ name, email, password }) {
  const trimmedName = String(name || '').trim();
  const normalizedEmail = normalizeEmail(email);
  const rawPassword = String(password || '');

  if (!trimmedName || !normalizedEmail || !rawPassword) {
    throw createError('name, email and password are required', 400);
  }
  if (rawPassword.length < 8) {
    throw createError('password must be at least 8 characters', 400);
  }

  const passwordHash = await bcrypt.hash(rawPassword, 10);
  const existingUser = await getUserByEmail(normalizedEmail);
  let user = existingUser;

  if (existingUser?.is_verified) {
    throw createError('An account with this email already exists', 409);
  }

  if (existingUser) {
    user = await updateUnverifiedUser(existingUser.id, {
      name: trimmedName,
      passwordHash,
    });
  } else {
    user = await createUser({
      name: trimmedName,
      email: normalizedEmail,
      passwordHash,
      createdAt: new Date().toISOString(),
    });
  }

  const otpResult = await issueSignupOtp(user);
  return {
    ...otpResult,
    email: user.email,
  };
}

export async function resendSignupOtp({ email }) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    throw createError('email is required', 400);
  }

  const user = await getUserByEmail(normalizedEmail);
  if (!user) {
    throw createError('User not found', 404);
  }
  if (user.is_verified) {
    throw createError('User is already verified', 400);
  }

  const otpResult = await issueSignupOtp(user);
  return {
    ...otpResult,
    email: user.email,
  };
}

export async function verifySignupOtp({ email, otp }) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedOtp = String(otp || '').trim();

  if (!normalizedEmail || !normalizedOtp) {
    throw createError('email and otp are required', 400);
  }

  await deleteExpiredOtps();
  const user = await getUserByEmail(normalizedEmail);
  if (!user) {
    throw createError('User not found', 404);
  }

  const latestOtp = await getLatestOtpForUser(user.id, OTP_PURPOSE);
  if (!latestOtp) {
    throw createError('No verification code found. Please request a new OTP.', 400);
  }
  if (new Date(latestOtp.expires_at).getTime() < Date.now()) {
    throw createError('Verification code expired. Please request a new OTP.', 400);
  }
  if (latestOtp.otp_hash !== hashOtp(normalizedOtp)) {
    throw createError('Invalid verification code', 400);
  }

  const verifiedUser = await markUserVerified(user.id);
  await deleteOtpsForUser(user.id, OTP_PURPOSE);

  return {
    token: createToken(verifiedUser),
    user: sanitizeUser(verifiedUser),
  };
}

export async function loginUser({ email, password }) {
  const normalizedEmail = normalizeEmail(email);
  const rawPassword = String(password || '');

  if (!normalizedEmail || !rawPassword) {
    throw createError('email and password are required', 400);
  }

  const user = await getUserByEmail(normalizedEmail);
  if (!user) {
    throw createError('Invalid email or password', 401);
  }
  if (!user.is_verified) {
    throw createError('Please verify your email before logging in', 403);
  }

  const isMatch = await bcrypt.compare(rawPassword, user.password_hash);
  if (!isMatch) {
    throw createError('Invalid email or password', 401);
  }

  return {
    token: createToken(user),
    user: sanitizeUser(user),
  };
}

export async function getAuthenticatedUser(userId) {
  const user = await getUserById(userId);
  if (!user) {
    throw createError('User not found', 404);
  }
  return sanitizeUser(user);
}

export async function updateAuthenticatedUser(
  userId,
  { name, email, mobile, dob, gender, profilePic }
) {
  const trimmedName = String(name || '').trim();
  const normalizedEmail = normalizeEmail(email);

  if (!trimmedName || !normalizedEmail) {
    throw createError('name and email are required', 400);
  }

  const user = await getUserById(userId);
  if (!user) {
    throw createError('User not found', 404);
  }

  const existingUser = await getUserByEmail(normalizedEmail);
  if (existingUser && existingUser.id !== userId) {
    throw createError('Another account already uses this email', 409);
  }

  const updatedUser = await updateUserProfile(userId, {
    name: trimmedName,
    email: normalizedEmail,
    mobile: String(mobile || '').trim() || null,
    dob: String(dob || '').trim() || null,
    gender: String(gender || '').trim() || null,
    profilePic: String(profilePic || '').trim() || null,
  });

  return {
    token: createToken(updatedUser),
    user: sanitizeUser(updatedUser),
  };
}

export async function changeAuthenticatedUserPassword(
  userId,
  { currentPassword, newPassword }
) {
  const current = String(currentPassword || '');
  const next = String(newPassword || '');

  if (!current || !next) {
    throw createError('currentPassword and newPassword are required', 400);
  }
  if (next.length < 8) {
    throw createError('new password must be at least 8 characters', 400);
  }

  const user = await getUserById(userId);
  if (!user) {
    throw createError('User not found', 404);
  }

  const isMatch = await bcrypt.compare(current, user.password_hash);
  if (!isMatch) {
    throw createError('Current password is incorrect', 400);
  }

  const passwordHash = await bcrypt.hash(next, 10);
  await updateUserPassword(userId, passwordHash);

  return { message: 'Password updated successfully' };
}

export function verifyAuthToken(token) {
  return jwt.verify(token, getJwtSecret());
}
