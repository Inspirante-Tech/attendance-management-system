import type { AuthenticatedUser } from '../middleware/auth';

// Global augmentation for Express Request to carry authenticated user and multer file(s)
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
