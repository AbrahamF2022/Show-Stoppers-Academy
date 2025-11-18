import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { JwtPayload, UserRecord } from '../types.js';

const expiresIn = '12h';

export function signJwt(user: UserRecord): string {
  const payload: JwtPayload = {
    sub: user.id,
    role: user.role,
    email: user.email,
    fullName: user.full_name,
  };

  return jwt.sign(payload, config.jwtSecret, { expiresIn });
}

export function verifyJwt(token: string): JwtPayload {
  return jwt.verify(token, config.jwtSecret) as JwtPayload;
}
