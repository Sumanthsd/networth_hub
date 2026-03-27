import {
  listAssets,
  getAsset,
  createAssetEntry,
  updateAssetEntry,
  deleteAssetEntry,
} from '../services/assetService.js';

export async function getAssets(req, res, next) {
  try {
    const assets = await listAssets(req.user.id);
    res.json(assets);
  } catch (err) {
    next(err);
  }
}

export async function getAssetById(req, res, next) {
  try {
    const asset = await getAsset(req.user.id, Number(req.params.id));
    res.json(asset);
  } catch (err) {
    next(err);
  }
}

export async function createAssetHandler(req, res, next) {
  try {
    const created = await createAssetEntry(req.user.id, req.body);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

export async function updateAssetHandler(req, res, next) {
  try {
    const updated = await updateAssetEntry(
      req.user.id,
      Number(req.params.id),
      req.body
    );
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function deleteAssetHandler(req, res, next) {
  try {
    await deleteAssetEntry(req.user.id, Number(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

