import {
  getNetWorthSummary,
  getAssetAllocation,
} from '../services/netWorthService.js';

export async function getSummary(req, res, next) {
  try {
    const summary = await getNetWorthSummary(req.user.id);
    res.json(summary);
  } catch (err) {
    next(err);
  }
}

export async function getAssetAllocationHandler(req, res, next) {
  try {
    const allocation = await getAssetAllocation(req.user.id);
    res.json(allocation);
  } catch (err) {
    next(err);
  }
}

