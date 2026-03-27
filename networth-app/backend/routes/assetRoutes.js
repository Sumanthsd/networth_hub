import { Router } from 'express';
import {
  getAssets,
  getAssetById,
  createAssetHandler,
  updateAssetHandler,
  deleteAssetHandler,
} from '../controllers/assetController.js';

const router = Router();

router.get('/', getAssets);
router.get('/:id', getAssetById);
router.post('/', createAssetHandler);
router.put('/:id', updateAssetHandler);
router.delete('/:id', deleteAssetHandler);

export default router;

