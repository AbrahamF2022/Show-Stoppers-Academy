import { supabase } from './supabaseClient.js';
import { UserRecord, UserRole } from '../types.js';

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as UserRecord | null;
}

export async function insertUser(user: {
  email: string;
  password_hash: string;
  full_name: string;
  role: UserRole;
}): Promise<UserRecord> {
  const { data, error } = await supabase
    .from('users')
    .insert({
      email: user.email.toLowerCase(),
      password_hash: user.password_hash,
      full_name: user.full_name,
      role: user.role,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as UserRecord;
}
