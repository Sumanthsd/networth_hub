import { Router } from 'express';
import {
  changePasswordHandler,
  loginHandler,
  meHandler,
  registerHandler,
  resendOtpHandler,
  updateProfileHandler,
  verifyOtpHandler,
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', registerHandler);
router.post('/verify-otp', verifyOtpHandler);
router.post('/resend-otp', resendOtpHandler);
router.post('/login', loginHandler);
router.get('/me', requireAuth, meHandler);
router.put('/profile', requireAuth, updateProfileHandler);
router.post('/change-password', requireAuth, changePasswordHandler);

export default router;
