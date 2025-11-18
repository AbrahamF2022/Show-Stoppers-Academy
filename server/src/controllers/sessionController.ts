import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { ApiError } from '../middleware/errorHandler.js';
import { createSession, listSessionAudits, listSessionsForUser, updateSessionStatus } from '../utils/sessionHelpers.js';

const createSessionSchema = z.object({
  tutorName: z.string().min(1).optional(),
  studentName: z.string().min(1).optional(),
  subject: z.string().min(1),
  startTime: z.string().datetime({ offset: true }),
  endTime: z.string().datetime({ offset: true }),
  notes: z.string().max(1000).optional(),
});

const statusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']),
});

export async function submitSession(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    throw new ApiError(401, 'Unauthorized');
  }

  const input = createSessionSchema.parse(req.body);

  const startTime = new Date(input.startTime);
  const endTime = new Date(input.endTime);

  if (endTime <= startTime) {
    throw new ApiError(400, 'End time must be after start time');
  }

  const tutorName = input.tutorName ?? (req.user.role === 'tutor' ? req.user.fullName : undefined);
  const studentName = input.studentName ?? (req.user.role === 'student' ? req.user.fullName : undefined);

  if (!tutorName || !studentName) {
    throw new ApiError(400, 'Tutor and student names are required');
  }

  const record = await createSession({
    tutor_id: req.user.role === 'tutor' ? req.user.sub : null,
    tutor_name: tutorName,
    student_id: req.user.role === 'student' ? req.user.sub : null,
    student_name: studentName,
    subject: input.subject,
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
    notes: input.notes,
  });

  res.status(201).json(record);
}

export async function listSessions(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    throw new ApiError(401, 'Unauthorized');
  }

  const sessions = await listSessionsForUser(req.user.sub, req.user.role);
  res.json({ sessions });
}

export async function changeSessionStatus(req: AuthenticatedRequest, res: Response) {
  if (!req.user || req.user.role !== 'admin') {
    throw new ApiError(403, 'Only admins can update session status');
  }

  const sessionId = req.params.sessionId;
  if (!sessionId) {
    throw new ApiError(400, 'Session ID is required');
  }

  const { status } = statusSchema.parse(req.body);

  const updated = await updateSessionStatus(sessionId, status, req.user.sub);
  res.json(updated);
}

export async function getSessionAudits(req: AuthenticatedRequest, res: Response) {
  if (!req.user || req.user.role !== 'admin') {
    throw new ApiError(403, 'Only admins can view audit logs');
  }

  const sessionId = req.params.sessionId;
  const audits = await listSessionAudits(sessionId);
  res.json({ audits });
}
