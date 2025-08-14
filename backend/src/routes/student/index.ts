import { Router } from 'express';
import { authenticateToken, requireStudent } from '../../middleware/auth';
import studentInfoRoutes from './studentInfoRoutes'

const router = Router();

console.log('=== STUDENT ROUTES MODULE LOADED ===');

// Apply authentication middleware to all student routes
router.use(authenticateToken);
router.use(requireStudent);

// Mount all student route modules
router.use('/', studentInfoRoutes);


export default router;