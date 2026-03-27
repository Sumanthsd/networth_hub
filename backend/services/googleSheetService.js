import { getSheetsClient } from '../config/googleClient.js';
import { execAsync } from '../config/db.js';
import {
  truncateAssets,
  createAsset,
} from '../models/assetModel.js';
import {
  truncateLiabilities,
  createLiability,
} from '../models/liabilityModel.js';
import { getNetWorthSummary } from './netWorthService.js';

function extractSpreadsheetId(sheetUrl) {
  const match = sheetUrl.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

export async function importFromGoogleSheet(userId, { sheetUrl, sheetName }) {
  if (!sheetUrl) {
    const error = new Error('sheetUrl is required');
    error.status = 400;
    throw error;
  }

  const spreadsheetId = extractSpreadsheetId(sheetUrl);
  if (!spreadsheetId) {
    const error = new Error('Could not parse spreadsheet ID from URL');
    error.status = 400;
    throw error;
  }

  const sheets = getSheetsClient();
  if (!sheets) {
    const error = new Error(
      'Google Sheets client is not configured. Check GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY.'
    );
    error.status = 500;
    throw error;
  }

  const range = sheetName ? `${sheetName}!A:E` : 'Sheet1!A:E';

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  const rows = response.data.values || [];
  if (rows.length <= 1) {
    return {
      assetsImported: 0,
      liabilitiesImported: 0,
      summary: await getNetWorthSummary(userId),
    };
  }

  const [, ...dataRows] = rows;
  const nowIso = new Date().toISOString();

  const assets = [];
  const liabilities = [];

  for (const row of dataRows) {
    const type = (row[0] || '').trim().toLowerCase();
    const category = (row[1] || 'Uncategorized').trim();
    const name = (row[2] || '').trim();
    const amountRaw = row[3];
    const notes = (row[4] || '').trim() || null;

    if (!type || !name) {
      continue;
    }

    const amount = Number(amountRaw);
    if (Number.isNaN(amount)) {
      continue;
    }

    if (type === 'asset') {
      assets.push({ userId, category, name, amount, notes, createdAt: nowIso });
    } else if (type === 'liability') {
      liabilities.push({ userId, category, name, amount, notes, createdAt: nowIso });
    }
  }

  if (assets.length === 0 && liabilities.length === 0) {
    const error = new Error('No valid asset or liability rows found in the sheet');
    error.status = 400;
    throw error;
  }

  await execAsync('BEGIN TRANSACTION');
  try {
    await truncateAssets(userId);
    await truncateLiabilities(userId);

    for (const asset of assets) {
      await createAsset(asset);
    }
    for (const liability of liabilities) {
      await createLiability(liability);
    }

    await execAsync('COMMIT');
  } catch (err) {
    await execAsync('ROLLBACK');
    throw err;
  }

  const summary = await getNetWorthSummary(userId);

  return {
    assetsImported: assets.length,
    liabilitiesImported: liabilities.length,
    summary,
  };
}

