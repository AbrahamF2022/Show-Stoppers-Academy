import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.js';

export function asyncHandler(
  fn: (
    req: Request | AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => Promise<any>
) {
  return (req: Request | AuthenticatedRequest, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

