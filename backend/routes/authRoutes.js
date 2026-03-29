import { Router } from 'express';
import {
  meHandler,
  updateProfileHandler,
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/me', requireAuth, meHandler);
router.put('/profile', requireAuth, updateProfileHandler);

export default router;
