import { Router } from 'express';
import DatabaseService from '../../lib/database';

const router = Router();
console.log('=== Table Structure Routes Loaded ===');

router.use((req, res, next) => {
  console.log('Request hit tableStrucRoutes:', req.path);
  next();
});


///this pae doesnt work heheheheh


router.get('/course/:courseId/teacher/:teacherId/components', async (req, res) => {
  try {
    const prisma = DatabaseService.getInstance();
    const { courseId, teacherId } = req.params;

    // Find course offering for this teacher & course
    const offering = await prisma.courseOffering.findFirst({
      where: {
        courseId,
        teacherId
      },
      include: {
        testComponents: true
      }
    });

    if (!offering) {
      return res.status(404).json({
        status: 'error',
        error: 'Course offering not found for this teacher/course'
      });
    }

    // Map test components into table-usable structure
    const components = offering.testComponents.map(tc => (    {
      id: tc.id,
      name: tc.name,
      maxMarks: tc.maxMarks,
      weightage: tc.weightage,
      type: tc.type
    }));

    res.json({
      status: 'success',
      offeringId: offering.id,
      courseId: offering.courseId,
      teacherId: offering.teacherId,
      components
    });
  } catch (error) {
    console.error('Error fetching test components:', error);
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

//to get marks of all students in that course by taught that teacher
router.get('/course/:courseId/teacher/:teacherId/marks', async (req, res) => {
  try {
    const prisma = DatabaseService.getInstance();
    const { courseId, teacherId } = req.params;

    // 1. Find the offering
    const offering = await prisma.courseOffering.findFirst({
      where: {
        courseId,
        teacherId
      },
      include: {
        enrollments: {
          include: {
            student: {
              include: {
                user: true // to get student name/email
              }
            },
            studentMarks: {
              include: {
                testComponent: true
              }
            }
          }
        }
      }
    });

    if (!offering) {
      return res.status(404).json({
        status: 'error',
        error: 'Course offering not found for this teacher/course'
      });
    }

    // 2. Restructure marks by student
    const students = offering.enrollments.map(enrollment => ({
      studentId: enrollment.student?.id,
      usn: enrollment.student?.usn,
      studentName: enrollment.student?.user?.name,
      studentEmail: enrollment.student?.user?.email,
      marks: enrollment.studentMarks.map(sm => ({
        componentId: sm.testComponentId,
        componentName: sm.testComponent.name,
        type: sm.testComponent.type,
        obtainedMarks: sm.marksObtained,
        maxMarks: sm.testComponent.maxMarks,
        weightage: sm.testComponent.weightage
      }))
    }));

    res.json({
      status: 'success',
      offeringId: offering.id,
      courseId: offering.courseId,
      teacherId: offering.teacherId,
      students
    });
  } catch (error) {
    console.error('Error fetching student marks:', error);
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});



export default router;


