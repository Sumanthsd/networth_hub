import { parse } from 'csv-parse/sync';
import { execAsync } from '../config/db.js';
import { truncateAssets, createAsset } from '../models/assetModel.js';
import { truncateLiabilities, createLiability } from '../models/liabilityModel.js';
import { getNetWorthSummary } from './netWorthService.js';

function normalizeHeader(h) {
  return String(h || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '');
}

function parseCsvToRows(csvText) {
  return parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
}

export async function importFromCsvText(userId, csvText) {
  if (!csvText || !csvText.trim()) {
    const error = new Error('Empty CSV file');
    error.status = 400;
    throw error;
  }

  let records;
  try {
    records = parseCsvToRows(csvText);
  } catch (e) {
    const error = new Error('Invalid CSV format');
    error.status = 400;
    throw error;
  }

  // Expected headers: Type, Category, Name, Amount, Notes (case-insensitive)
  const nowIso = new Date().toISOString();
  const assets = [];
  const liabilities = [];

  for (const rec of records) {
    // tolerate header variants by normalizing keys
    const map = {};
    for (const [k, v] of Object.entries(rec)) map[normalizeHeader(k)] = v;

    const type = String(map.type || '').trim().toLowerCase();
    const category = String(map.category || 'Uncategorized').trim();
    const name = String(map.name || '').trim();
    const amount = Number(map.amount);
    const notes = String(map.notes || '').trim() || null;

    if (!type || !name || Number.isNaN(amount)) continue;

    if (type === 'asset') {
      assets.push({ userId, category, name, amount, notes, createdAt: nowIso });
    }
    if (type === 'liability') {
      liabilities.push({ userId, category, name, amount, notes, createdAt: nowIso });
    }
  }

  if (assets.length === 0 && liabilities.length === 0) {
    const error = new Error('No valid asset or liability rows found in the CSV');
    error.status = 400;
    throw error;
  }

  await execAsync('BEGIN TRANSACTION');
  try {
    await truncateAssets(userId);
    await truncateLiabilities(userId);

    for (const a of assets) await createAsset(a);
    for (const l of liabilities) await createLiability(l);

    await execAsync('COMMIT');
  } catch (err) {
    await execAsync('ROLLBACK');
    throw err;
  }

  return {
    assetsImported: assets.length,
    liabilitiesImported: liabilities.length,
    summary: await getNetWorthSummary(userId),
  };
}

