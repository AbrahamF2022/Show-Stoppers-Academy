import { Router } from 'express';
import { changeSessionStatus, getSessionAudits, listSessions, submitSession } from '../controllers/sessionController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.post('/', requireAuth, requireRole('tutor', 'student'), submitSession);
router.get('/', requireAuth, listSessions);
router.get('/audits', requireAuth, requireRole('admin'), getSessionAudits);
router.patch('/:sessionId/status', requireAuth, requireRole('admin'), changeSessionStatus);
router.get('/:sessionId/audits', requireAuth, requireRole('admin'), getSessionAudits);

export default router;
