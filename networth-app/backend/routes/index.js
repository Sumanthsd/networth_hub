import { Router } from 'express';
import authRoutes from './authRoutes.js';
import assetRoutes from './assetRoutes.js';
import liabilityRoutes from './liabilityRoutes.js';
import netWorthRoutes from './netWorthRoutes.js';
import importRoutes from './importRoutes.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use('/auth', authRoutes);
router.use(requireAuth);
router.use('/assets', assetRoutes);
router.use('/liabilities', liabilityRoutes);
router.use('/networth', netWorthRoutes);
router.use('/import', importRoutes);

export default router;

