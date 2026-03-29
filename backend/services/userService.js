import { getUserById, updateUserProfile } from '../models/userModel.js';

function createError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export function sanitizeUser(user) {
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
    clerkUserId: user.clerk_user_id || '',
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
  { mobile, dob, gender, profilePic }
) {
  const user = await getUserById(userId);
  if (!user) {
    throw createError('User not found', 404);
  }

  const updatedUser = await updateUserProfile(userId, {
    mobile: String(mobile || '').trim() || null,
    dob: String(dob || '').trim() || null,
    gender: String(gender || '').trim() || null,
    profilePic: String(profilePic || '').trim() || null,
  });

  return {
    user: sanitizeUser(updatedUser),
  };
}
