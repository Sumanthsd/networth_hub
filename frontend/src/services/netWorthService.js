import apiClient from './apiClient.js';

export async function getSummary() {
  const { data } = await apiClient.get('/api/networth/summary');
  return data;
}

export async function getAssetAllocation() {
  const { data } = await apiClient.get('/api/networth/asset-allocation');
  return data;
}

