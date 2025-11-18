import { Router } from 'express';
import healthRouter from './health.js';
import authRouter from './auth.js';
import sessionsRouter from './sessions.js';

const router = Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/sessions', sessionsRouter);

export default router;
