// src/routes/admin/marksRoutes.ts
/**
 * Marks management routes for admins and teachers
 * Handles CRUD operations for theory and lab marks
 */
import { Router } from 'express';
import DatabaseService from '../../lib/database';
import { GetMarksParams, UpdateMarksRequest } from '../../types/marks.types';
import { ApiResponse } from '../../types/common.types';
import {
  hasTheoryMarksUpdate,
  hasLabMarksUpdate,
  buildTheoryMarksData,
  buildLabMarksData,
  transformToMarksData,
  buildMarksWhereClause
} from '../../utils/marks.helpers';

const router = Router();

console.log('=== ADMIN MARKS ROUTES LOADED ===');

/**
 * GET /marks
 * Retrieves marks for students based on filters
 * Query parameters:
 * - courseId: Filter by course
 * - departmentId: Filter by department
 * - year: Filter by batch year
 * - studentId: Filter by student UUID
 * - studentUsn: Filter by student USN
 */
/**
 * GET /marks
 * Retrieves marks for students based on filters
 * Query parameters:
 * - courseId: Filter by course
 * - departmentId: Filter by department
 * - year: Filter by batch year
 * - studentId: Filter by student UUID
 * - studentUsn: Filter by student USN
 */
router.get('/marks', async (req, res) => {
  try {
    const prisma = DatabaseService.getInstance();
    const params = req.query as Partial<GetMarksParams>;

    // Build where clause based on query parameters
    const whereClause = buildMarksWhereClause(params);

    // Fetch enrollments with marks
    const enrollments = await prisma.studentEnrollment.findMany({
      where: whereClause,
      include: {
        student: {
          include: {
            user: { select: { name: true } }
          }
        },
        offering: {
          include: {
            course: { select: { id: true, code: true, name: true } }
          }
        },
        theoryMarks: true,
        labMarks: true
      }
    }) as any[];

    // Transform data to standardized format
    const marksData = enrollments.map(transformToMarksData);

    res.json({
      status: 'success',
      data: marksData
    } as ApiResponse);

  } catch (error) {
    console.error('Error fetching marks:', error);
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    } as ApiResponse);
  }
});

/**
 * GET /marks/:enrollmentId
 * Retrieves marks for a specific enrollment
 */
router.get('/marks/:enrollmentId', async (req, res) => {
  try {
    const prisma = DatabaseService.getInstance();
    const { enrollmentId } = req.params;

    const enrollment = await prisma.studentEnrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        student: {
          include: {
            user: { select: { name: true } }
          }
        },
        offering: {
          include: {
            course: { select: { id: true, code: true, name: true } }
          }
        },
        theoryMarks: true,
        labMarks: true
      }
    }) as any;

    if (!enrollment) {
      return res.status(404).json({
        status: 'error',
        error: 'Enrollment not found'
      } as ApiResponse);
    }

    const marksData = transformToMarksData(enrollment);

    res.json({
      status: 'success',
      data: marksData
    } as ApiResponse);

  } catch (error) {
    console.error('Error fetching enrollment marks:', error);
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    } as ApiResponse);
  }
});

/**
 * PUT /marks/:enrollmentId
 * Updates marks for a specific enrollment
 * Body: Theory and/or lab marks fields
 */
router.put('/marks/:enrollmentId', async (req, res) => {
  const { enrollmentId } = req.params;
  const markData = req.body as UpdateMarksRequest;

  try {
    const prisma = DatabaseService.getInstance();

    // Check if enrollment exists
    const enrollment = await prisma.studentEnrollment.findUnique({
      where: { id: enrollmentId }
    });

    if (!enrollment) {
      return res.status(404).json({
        status: 'error',
        error: 'Enrollment not found'
      } as ApiResponse);
    }

    // Determine if this is theory or lab marks update
    const isTheoryUpdate = hasTheoryMarksUpdate(markData);
    const isLabUpdate = hasLabMarksUpdate(markData);

    // Update theory marks if applicable
    if (isTheoryUpdate) {
      // Get current marks to check MSE3 eligibility
      const currentMarks = await prisma.theoryMarks.findUnique({
        where: { enrollmentId }
      });

      const theoryMarkData = buildTheoryMarksData(markData, currentMarks);

      await prisma.theoryMarks.upsert({
        where: { enrollmentId },
        update: theoryMarkData,
        create: {
          enrollmentId,
          ...theoryMarkData
        }
      });
    }

    // Update lab marks if applicable
    if (isLabUpdate) {
      const labMarkData = buildLabMarksData(markData);

      await prisma.labMarks.upsert({
        where: { enrollmentId },
        update: labMarkData,
        create: {
          enrollmentId,
          ...labMarkData
        }
      });
    }

    res.json({
      status: 'success',
      message: 'Marks updated successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Error updating marks:', error);
    console.error('EnrollmentId:', enrollmentId);
    console.error('Mark data:', markData);
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      debug: {
        enrollmentId,
        markData,
        errorDetails: error instanceof Error ? error.stack : 'Unknown error'
      }
    } as ApiResponse);
  }
});

export default router;
