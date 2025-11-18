export type UserRole = 'admin' | 'tutor' | 'student';

export interface UserRecord {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  password_hash?: string;
  created_at: string;
  updated_at: string;
}

export interface JwtPayload {
  sub: string;
  role: UserRole;
  email: string;
  fullName: string;
}
