import { Router } from 'express';
import { changeSessionStatus, getSessionAudits, listSessions, submitSession } from '../controllers/sessionController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.post('/', requireAuth, requireRole('tutor', 'student'), asyncHandler(submitSession));
router.get('/', requireAuth, asyncHandler(listSessions));
router.get('/audits', requireAuth, requireRole('admin'), asyncHandler(getSessionAudits));
router.patch('/:sessionId/status', requireAuth, requireRole('admin'), asyncHandler(changeSessionStatus));
router.get('/:sessionId/audits', requireAuth, requireRole('admin'), asyncHandler(getSessionAudits));

export default router;
