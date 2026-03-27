import apiClient from './apiClient.js';

export async function importFromGoogleSheet(payload) {
  const { data } = await apiClient.post('/api/import/google-sheet', payload);
  return data;
}

export async function importFromCsvFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post('/api/import/csv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function importSampleData() {
  const { data } = await apiClient.post('/api/import/sample');
  return data;
}

