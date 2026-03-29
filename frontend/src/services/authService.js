import apiClient from './apiClient.js';

function extractMessage(error, fallback) {
  return error?.response?.data?.message || error?.message || fallback;
}

export async function getCurrentUser() {
  try {
    const { data } = await apiClient.get('/api/auth/me');
    return data;
  } catch (error) {
    if (error?.response?.status === 401) {
      return null;
    }
    return null;
  }
}

export async function updateProfile(payload) {
  try {
    const { data } = await apiClient.put('/api/auth/profile', payload);
    return data;
  } catch (error) {
    throw new Error(extractMessage(error, 'Failed to update profile.'));
  }
}
