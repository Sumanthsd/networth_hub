import { sumAssets, getAssetAllocationByCategory } from '../models/assetModel.js';
import { sumLiabilities } from '../models/liabilityModel.js';

export async function getNetWorthSummary(userId) {
  const [totalAssets, totalLiabilities] = await Promise.all([
    sumAssets(userId),
    sumLiabilities(userId),
  ]);

  return {
    totalAssets,
    totalLiabilities,
    netWorth: totalAssets - totalLiabilities,
  };
}

export async function getAssetAllocation(userId) {
  const rows = await getAssetAllocationByCategory(userId);
  return rows.map((row) => ({
    category: row.category,
    totalAmount: row.totalAmount,
  }));
}

