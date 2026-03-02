import { Router } from 'express';
import healthRouter from './health.js';
import authRouter from './auth.js';
import sessionsRouter from './sessions.js';
import shopRouter from './shop.js';

const router = Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/sessions', sessionsRouter);
router.use('/shop', shopRouter);

export default router;
