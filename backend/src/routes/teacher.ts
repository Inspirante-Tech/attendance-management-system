// src/routes/teacher.ts
import { Router } from 'express';
import dashboardRoutes from './teacher/dashboardRoutes';
import courseRoutes from './teacher/courseRoutes';
import attendanceRoutes from './teacher/attendanceRoutes';
import marksRoutes from './teacher/marksRoutes';

const router = Router();

// Compose teacher sub-routers
router.use('/', dashboardRoutes);
router.use('/', courseRoutes);
router.use('/', attendanceRoutes);
router.use('/', marksRoutes);

export default router;
