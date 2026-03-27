import apiClient from './apiClient.js';

export async function getAssets() {
  const { data } = await apiClient.get('/api/assets');
  return data;
}

export async function createAsset(payload) {
  const { data } = await apiClient.post('/api/assets', payload);
  return data;
}

export async function updateAsset(id, payload) {
  const { data } = await apiClient.put(`/api/assets/${id}`, payload);
  return data;
}

export async function deleteAsset(id) {
  await apiClient.delete(`/api/assets/${id}`);
}

