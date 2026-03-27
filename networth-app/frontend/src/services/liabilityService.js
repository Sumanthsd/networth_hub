import apiClient from './apiClient.js';

export async function getLiabilities() {
  const { data } = await apiClient.get('/api/liabilities');
  return data;
}

export async function createLiability(payload) {
  const { data } = await apiClient.post('/api/liabilities', payload);
  return data;
}

export async function updateLiability(id, payload) {
  const { data } = await apiClient.put(`/api/liabilities/${id}`, payload);
  return data;
}

export async function deleteLiability(id) {
  await apiClient.delete(`/api/liabilities/${id}`);
}

