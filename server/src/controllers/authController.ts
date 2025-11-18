import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { ApiError } from '../middleware/errorHandler.js';
import { findUserByEmail, insertUser } from '../utils/supabaseHelpers.js';
import { signJwt } from '../utils/jwt.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { UserRole } from '../types.js';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(1),
  role: z.enum(['tutor', 'student', 'admin']).optional().default('tutor'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function registerUser(req: AuthenticatedRequest, res: Response) {
  if (!req.user || req.user.role !== 'admin') {
    throw new ApiError(403, 'Only admins can register new users');
  }

  const { email, password, fullName, role } = registerSchema.parse(req.body);

  const existing = await findUserByEmail(email);
  if (existing) {
    throw new ApiError(409, 'User with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = await insertUser({
    email,
    password_hash: passwordHash,
    full_name: fullName,
    role: role as UserRole,
  });

  res.status(201).json({
    id: newUser.id,
    email: newUser.email,
    fullName: newUser.full_name,
    role: newUser.role,
  });
}

export async function loginUser(req: Request, res: Response) {
  const { email, password } = loginSchema.parse(req.body);

  const user = await findUserByEmail(email);
  if (!user || !user.password_hash) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const token = signJwt(user);

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
    },
  });
}

export function getCurrentUser(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    throw new ApiError(401, 'Unauthorized');
  }

  res.json({ user: req.user });
}
