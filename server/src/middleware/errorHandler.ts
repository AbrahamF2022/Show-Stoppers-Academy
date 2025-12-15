import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function errorHandler(
  err: Error | ApiError | ZodError,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation error',
      details: err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // Handle ApiError
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.message });
  }

  // Handle unexpected errors
  console.error('Unexpected error:', err);
  res.status(500).json({ error: 'Internal server error' });
}
