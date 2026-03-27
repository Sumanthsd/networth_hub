import { Router } from 'express';
import {
  getLiabilities,
  getLiabilityById,
  createLiabilityHandler,
  updateLiabilityHandler,
  deleteLiabilityHandler,
} from '../controllers/liabilityController.js';

const router = Router();

router.get('/', getLiabilities);
router.get('/:id', getLiabilityById);
router.post('/', createLiabilityHandler);
router.put('/:id', updateLiabilityHandler);
router.delete('/:id', deleteLiabilityHandler);

export default router;

