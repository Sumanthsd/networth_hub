import {
  getAllAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
} from '../models/assetModel.js';

function validateAssetPayload(payload) {
  const { category, name, amount } = payload;
  if (!category || !name || amount === undefined || amount === null) {
    const error = new Error('category, name and amount are required');
    error.status = 400;
    throw error;
  }
  const numericAmount = Number(amount);
  if (Number.isNaN(numericAmount)) {
    const error = new Error('amount must be a number');
    error.status = 400;
    throw error;
  }
  return {
    category: String(category),
    name: String(name),
    amount: numericAmount,
    notes: payload.notes ? String(payload.notes) : null,
  };
}

export async function listAssets(userId) {
  return getAllAssets(userId);
}

export async function getAsset(userId, id) {
  const asset = await getAssetById(id, userId);
  if (!asset) {
    const error = new Error('Asset not found');
    error.status = 404;
    throw error;
  }
  return asset;
}

export async function createAssetEntry(userId, payload) {
  const data = validateAssetPayload(payload);
  const createdAt = new Date().toISOString();
  return createAsset({ userId, ...data, createdAt });
}

export async function updateAssetEntry(userId, id, payload) {
  await getAsset(userId, id);
  const data = validateAssetPayload(payload);
  return updateAsset(id, userId, data);
}

export async function deleteAssetEntry(userId, id) {
  await getAsset(userId, id);
  await deleteAsset(id, userId);
}

