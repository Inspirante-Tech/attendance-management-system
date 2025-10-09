import { Router } from 'express';
import { authenticateToken, requireTeacher } from '../../middleware/auth';

const router = Router();

// Protected test route
router.get('/', authenticateToken, requireTeacher, (req, res) => {
  res.json({ status: 'ok', message: 'Teacher auth working ✅' });
});

export default router;
