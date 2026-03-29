import { clerkClient } from '@clerk/express';
import {
  createUser,
  getUserByClerkUserId,
  getUserByEmail,
  syncClerkIdentity,
} from '../models/userModel.js';

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function buildDisplayName(clerkUser) {
  const fullName = String(clerkUser.fullName || '').trim();
  if (fullName) {
    return fullName;
  }

  const firstName = String(clerkUser.firstName || '').trim();
  const lastName = String(clerkUser.lastName || '').trim();
  const joined = [firstName, lastName].filter(Boolean).join(' ').trim();
  if (joined) {
    return joined;
  }

  const email = getPrimaryEmail(clerkUser);
  return email ? email.split('@')[0] : 'NetWorth User';
}

function getPrimaryEmail(clerkUser) {
  const primary =
    clerkUser.emailAddresses?.find(
      (entry) => entry.id === clerkUser.primaryEmailAddressId
    ) || clerkUser.emailAddresses?.[0];

  return normalizeEmail(primary?.emailAddress);
}

export async function loadClerkUser(clerkUserId) {
  return clerkClient.users.getUser(clerkUserId);
}

export async function syncLocalUserFromClerk(clerkUser) {
  const clerkUserId = String(clerkUser.id || '').trim();
  const email = getPrimaryEmail(clerkUser);
  const name = buildDisplayName(clerkUser);
  const profilePic = String(clerkUser.imageUrl || '').trim() || null;

  if (!clerkUserId || !email) {
    const error = new Error('Clerk user is missing a primary email address');
    error.status = 400;
    throw error;
  }

  const existingByClerkId = await getUserByClerkUserId(clerkUserId);
  if (existingByClerkId) {
    return syncClerkIdentity(existingByClerkId.id, {
      clerkUserId,
      name,
      email,
      isVerified: 1,
      profilePic,
    });
  }

  const existingByEmail = await getUserByEmail(email);
  if (existingByEmail) {
    return syncClerkIdentity(existingByEmail.id, {
      clerkUserId,
      name,
      email,
      isVerified: 1,
      profilePic,
    });
  }

  return createUser({
    name,
    email,
    passwordHash: 'clerk-managed',
    clerkUserId,
    profilePic,
    isVerified: 1,
    createdAt: new Date().toISOString(),
  });
}
