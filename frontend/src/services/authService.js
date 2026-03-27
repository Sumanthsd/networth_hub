import apiClient, { getStoredToken, setStoredToken } from './apiClient.js';

function extractMessage(error, fallback) {
  return error?.response?.data?.message || error?.message || fallback;
}

export async function registerUser(payload) {
  try {
    const { data } = await apiClient.post('/api/auth/register', payload);
    return data;
  } catch (error) {
    throw new Error(extractMessage(error, 'Failed to register user.'));
  }
}

export async function verifyOtp(payload) {
  try {
    const { data } = await apiClient.post('/api/auth/verify-otp', payload);
    if (data?.token) {
      setStoredToken(data.token);
    }
    return data;
  } catch (error) {
    throw new Error(extractMessage(error, 'Failed to verify code.'));
  }
}

export async function resendOtp(payload) {
  try {
    const { data } = await apiClient.post('/api/auth/resend-otp', payload);
    return data;
  } catch (error) {
    throw new Error(extractMessage(error, 'Failed to resend code.'));
  }
}

export async function loginUser(payload) {
  try {
    const { data } = await apiClient.post('/api/auth/login', payload);
    if (data?.token) {
      setStoredToken(data.token);
    }
    return data;
  } catch (error) {
    throw new Error(extractMessage(error, 'Failed to login.'));
  }
}

export async function getCurrentUser() {
  const token = getStoredToken();
  if (!token) {
    return null;
  }

  try {
    const { data } = await apiClient.get('/api/auth/me');
    return data;
  } catch (error) {
    setStoredToken('');
    return null;
  }
}

export async function updateProfile(payload) {
  try {
    const { data } = await apiClient.put('/api/auth/profile', payload);
    if (data?.token) {
      setStoredToken(data.token);
    }
    return data;
  } catch (error) {
    throw new Error(extractMessage(error, 'Failed to update profile.'));
  }
}

export async function changePassword(payload) {
  try {
    const { data } = await apiClient.post('/api/auth/change-password', payload);
    return data;
  } catch (error) {
    throw new Error(extractMessage(error, 'Failed to change password.'));
  }
}

export function logoutUser() {
  setStoredToken('');
}
