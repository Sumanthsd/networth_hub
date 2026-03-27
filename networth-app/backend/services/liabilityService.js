import {
  getAllLiabilities,
  getLiabilityById,
  createLiability,
  updateLiability,
  deleteLiability,
} from '../models/liabilityModel.js';

function validateLiabilityPayload(payload) {
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

export async function listLiabilities(userId) {
  return getAllLiabilities(userId);
}

export async function getLiability(userId, id) {
  const liability = await getLiabilityById(id, userId);
  if (!liability) {
    const error = new Error('Liability not found');
    error.status = 404;
    throw error;
  }
  return liability;
}

export async function createLiabilityEntry(userId, payload) {
  const data = validateLiabilityPayload(payload);
  const createdAt = new Date().toISOString();
  return createLiability({ userId, ...data, createdAt });
}

export async function updateLiabilityEntry(userId, id, payload) {
  await getLiability(userId, id);
  const data = validateLiabilityPayload(payload);
  return updateLiability(id, userId, data);
}

export async function deleteLiabilityEntry(userId, id) {
  await getLiability(userId, id);
  await deleteLiability(id, userId);
}

