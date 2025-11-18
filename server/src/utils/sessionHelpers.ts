import { supabase } from './supabaseClient.js';
import { ApiError } from '../middleware/errorHandler.js';
import { UserRole } from '../types.js';

export interface CreateSessionInput {
  tutor_id: string | null;
  tutor_name: string;
  student_id: string | null;
  student_name: string;
  subject: string;
  start_time: string;
  end_time: string;
  notes?: string;
}

export async function createSession(input: CreateSessionInput) {
  const { data, error } = await supabase
    .from('tutoring_sessions')
    .insert({
      tutor_id: input.tutor_id,
      tutor_name: input.tutor_name,
      student_id: input.student_id,
      student_name: input.student_name,
      subject: input.subject,
      start_time: input.start_time,
      end_time: input.end_time,
      notes: input.notes,
    })
    .select()
    .single();

  if (error) {
    throw new ApiError(500, error.message);
  }

  return data;
}

export async function listSessionsForUser(userId: string, role: UserRole) {
  const query = supabase.from('tutoring_sessions').select('*').order('start_time', { ascending: false });

  if (role === 'tutor') {
    query.eq('tutor_id', userId);
  } else if (role === 'student') {
    query.eq('student_id', userId);
  }

  const { data, error } = await query;

  if (error) {
    throw new ApiError(500, error.message);
  }

  return data;
}

export async function updateSessionStatus(
  sessionId: string,
  status: 'pending' | 'approved' | 'rejected',
  adminId: string
) {
  const existing = await supabase
    .from('tutoring_sessions')
    .select('approval_status')
    .eq('id', sessionId)
    .maybeSingle();

  if (existing.error) {
    throw new ApiError(500, existing.error.message);
  }

  if (!existing.data) {
    throw new ApiError(404, 'Session not found');
  }

  const oldStatus = existing.data.approval_status as 'pending' | 'approved' | 'rejected';

  if (oldStatus === status) {
    const { data: unchanged, error: unchangedError } = await supabase
      .from('tutoring_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (unchangedError) {
      throw new ApiError(500, unchangedError.message);
    }

    return unchanged;
  }

  const { data, error } = await supabase
    .from('tutoring_sessions')
    .update({
      approval_status: status,
      approved_by: status === 'pending' ? null : adminId,
    })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) {
    throw new ApiError(500, error.message);
  }

  const { error: auditError } = await supabase.from('tutoring_session_audit').insert({
    session_id: sessionId,
    changed_by: adminId,
    old_status: oldStatus,
    new_status: status,
  });

  if (auditError) {
    console.error('Failed to record audit log', auditError);
  }

  return data;
}

export async function listSessionAudits(sessionId?: string) {
  const query = supabase
    .from('tutoring_session_audit')
    .select('id, session_id, changed_by, old_status, new_status, created_at')
    .order('created_at', { ascending: false });

  if (sessionId) {
    query.eq('session_id', sessionId);
  }

  const { data, error } = await query;
  if (error) {
    throw new ApiError(500, error.message);
  }
  return data;
}
