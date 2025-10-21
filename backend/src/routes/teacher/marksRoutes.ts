// src/routes/teacher/marksRoutes.ts
import { Router } from 'express';
import DatabaseService from '../../lib/database';
import { authenticateToken, AuthenticatedRequest } from '../../middleware/auth';

const router = Router();

// Update student marks (teachers can only update marks for their assigned courses)
router.put('/marks/:enrollmentId', authenticateToken, async (req: AuthenticatedRequest, res) => {
    const { enrollmentId } = req.params;
    const markData = req.body;

    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ status: 'error', message: 'User not authenticated' });
        }

        const prisma = DatabaseService.getInstance();

        const teacher = await prisma.teacher.findUnique({ where: { userId } });
        if (!teacher) {
            return res.status(403).json({ status: 'error', message: 'Teacher not found' });
        }

        const enrollment = await prisma.studentEnrollment.findUnique({
            where: { id: enrollmentId },
            include: { offering: { include: { teacher: true } } }
        });
        if (!enrollment) {
            return res.status(404).json({ status: 'error', error: 'Enrollment not found' });
        }
        if (!enrollment.offering || enrollment.offering.teacherId !== teacher.id) {
            return res.status(403).json({ status: 'error', error: 'Access denied - you can only update marks for your assigned courses' });
        }

        const isTheoryUpdate = ['mse1_marks', 'mse2_marks', 'mse3_marks', 'task1_marks', 'task2_marks', 'task3_marks'].some(field => field in markData);
        const isLabUpdate = ['record_marks', 'continuous_evaluation_marks', 'lab_mse_marks'].some(field => field in markData);

        if (isTheoryUpdate) {
            const theoryMarkData: any = {};
            if ('mse1_marks' in markData) theoryMarkData.mse1Marks = markData.mse1_marks;
            if ('mse2_marks' in markData) theoryMarkData.mse2Marks = markData.mse2_marks;
            if ('mse3_marks' in markData) theoryMarkData.mse3Marks = markData.mse3_marks;
            if ('task1_marks' in markData) theoryMarkData.task1Marks = markData.task1_marks;
            if ('task2_marks' in markData) theoryMarkData.task2Marks = markData.task2_marks;
            if ('task3_marks' in markData) theoryMarkData.task3Marks = markData.task3_marks;

            const currentMarks = await prisma.theoryMarks.findUnique({ where: { enrollmentId } });
            const mse1 = theoryMarkData.mse1Marks !== undefined ? theoryMarkData.mse1Marks : (currentMarks?.mse1Marks || 0);
            const mse2 = theoryMarkData.mse2Marks !== undefined ? theoryMarkData.mse2Marks : (currentMarks?.mse2Marks || 0);
            if ((mse1 + mse2) >= 20) {
                theoryMarkData.mse3Marks = null;
            }
            theoryMarkData.lastUpdatedAt = new Date();

            await prisma.theoryMarks.upsert({
                where: { enrollmentId },
                update: theoryMarkData,
                create: { enrollmentId, ...theoryMarkData }
            });
        }

        if (isLabUpdate) {
            const labMarkData: any = {};
            if ('record_marks' in markData) labMarkData.recordMarks = markData.record_marks;
            if ('continuous_evaluation_marks' in markData) labMarkData.continuousEvaluationMarks = markData.continuous_evaluation_marks;
            if ('lab_mse_marks' in markData) labMarkData.labMseMarks = markData.lab_mse_marks;
            labMarkData.lastUpdatedAt = new Date();

            await prisma.labMarks.upsert({
                where: { enrollmentId },
                update: labMarkData,
                create: { enrollmentId, ...labMarkData }
            });
        }

        res.json({ status: 'success', message: 'Marks updated successfully' });
    } catch (error) {
        console.error('Error updating marks:', error);
        res.status(500).json({ status: 'error', message: 'Failed to update marks', error: error instanceof Error ? error.message : 'Unknown error' });
    }
});

// Get marks for students in teacher's courses
router.get('/marks', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
        const userId = req.user?.id;
        const { courseId, studentUsn } = req.query;
        if (!userId) {
            return res.status(401).json({ status: 'error', message: 'User not authenticated' });
        }

        const prisma = DatabaseService.getInstance();
        const teacher = await prisma.teacher.findUnique({ where: { userId }, include: { courseOfferings: { include: { course: true } } } });
        if (!teacher) {
            return res.status(403).json({ status: 'error', message: 'Teacher not found' });
        }

        const whereClause: any = { offering: { teacherId: teacher.id } };
        if (courseId) whereClause.offering.courseId = courseId as string;
        if (studentUsn) whereClause.student = { usn: studentUsn as string };

        const enrollments = await prisma.studentEnrollment.findMany({
            where: whereClause,
            include: {
                student: { include: { user: { select: { id: true, name: true, email: true } } } },
                offering: { include: { course: { select: { id: true, code: true, name: true } } } },
                theoryMarks: true,
                labMarks: true
            }
        });

        const transformedData = enrollments.map(enrollment => ({
            id: enrollment.id,
            enrollmentId: enrollment.id,
            student: enrollment.student ? { id: enrollment.student.id, usn: enrollment.student.usn, user: enrollment.student.user } : null,
            course: enrollment.offering?.course || null,
            theoryMarks: enrollment.theoryMarks ? {
                id: enrollment.theoryMarks.id,
                mse1_marks: enrollment.theoryMarks.mse1Marks,
                mse2_marks: enrollment.theoryMarks.mse2Marks,
                mse3_marks: enrollment.theoryMarks.mse3Marks,
                task1_marks: enrollment.theoryMarks.task1Marks,
                task2_marks: enrollment.theoryMarks.task2Marks,
                task3_marks: enrollment.theoryMarks.task3Marks,
                last_updated_at: enrollment.theoryMarks.lastUpdatedAt
            } : null,
            labMarks: enrollment.labMarks ? {
                id: enrollment.labMarks.id,
                record_marks: enrollment.labMarks.recordMarks,
                continuous_evaluation_marks: enrollment.labMarks.continuousEvaluationMarks,
                lab_mse_marks: enrollment.labMarks.labMseMarks,
                last_updated_at: enrollment.labMarks.lastUpdatedAt
            } : null,
            updatedAt: new Date()
        }));

        res.json({ status: 'success', data: transformedData });
    } catch (error) {
        console.error('Error fetching teacher marks:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch marks', error: error instanceof Error ? error.message : 'Unknown error' });
    }
});

export default router;
