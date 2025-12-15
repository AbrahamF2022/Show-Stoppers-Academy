import { Router } from 'express';
import { getCurrentUser, loginUser, registerUser } from '../controllers/authController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.post('/login', asyncHandler(loginUser));
router.post('/register', requireAuth, requireRole('admin'), asyncHandler(registerUser));
router.get('/me', requireAuth, asyncHandler(getCurrentUser));

export default router;
