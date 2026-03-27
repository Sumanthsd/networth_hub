import { Router } from 'express';
import {
  getSummary,
  getAssetAllocationHandler,
} from '../controllers/netWorthController.js';

const router = Router();

router.get('/summary', getSummary);
router.get('/asset-allocation', getAssetAllocationHandler);

export default router;

