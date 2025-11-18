import { Router } from 'express';
import { getCurrentUser, loginUser, registerUser } from '../controllers/authController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.post('/login', loginUser);
router.post('/register', requireAuth, requireRole('admin'), registerUser);
router.get('/me', requireAuth, getCurrentUser);

export default router;
