import type { AuthenticatedUser } from '../middleware/auth';

// Augment Express to include the authenticated user on every request
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      file?: any;
      files?: any;
    }
  }
}

export {};
