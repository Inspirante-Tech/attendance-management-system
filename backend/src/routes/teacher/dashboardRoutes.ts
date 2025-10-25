// src/routes/teacher/dashboardRoutes.ts
import { Router } from 'express';
import DatabaseService from '../../lib/database';
import { authenticateToken, AuthenticatedRequest } from '../../middleware/auth';
import {
    getTeacherByUserId,
    calculateDashboardStats,
    getTotalSessionsCount,
    getRecentAttendanceSessions
} from '../../utils/teacher.helpers';

const router = Router();

/**
 * GET /api/teacher/dashboard
 * Get teacher profile and dashboard data
 */
router.get('/dashboard', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ status: 'error', message: 'User not authenticated' });
        }

        // Get teacher profile with related data
        const teacher = await getTeacherByUserId(userId);

        if (!teacher) {
            return res.status(404).json({ status: 'error', message: 'Teacher profile not found' });
        }

        // Calculate statistics
        const stats = calculateDashboardStats(teacher);
        const totalSessionsCount = await getTotalSessionsCount(teacher.id);
        stats.totalSessions = totalSessionsCount;

        // Get recent attendance sessions for display
        const recentAttendanceSessions = await getRecentAttendanceSessions(teacher.id, 5);

        // Calculate average attendance across all sessions
        const prisma = DatabaseService.getInstance();
        const allAttendanceSessions = await prisma.attendance.findMany({
            where: {
                teacherId: teacher.id,
                status: 'held'
            },
            include: {
                attendanceRecords: true
            }
        });

        let averageAttendance = 0;
        if (allAttendanceSessions.length > 0) {
            const totalAttendanceRecords = allAttendanceSessions.reduce(
                (sum, session) => sum + session.attendanceRecords.length,
                0
            );
            const totalPresentRecords = allAttendanceSessions.reduce((sum, session) =>
                sum + session.attendanceRecords.filter(record => record.status === 'present').length,
                0
            );

            averageAttendance = totalAttendanceRecords > 0
                ? (totalPresentRecords / totalAttendanceRecords) * 100
                : 0;
        }

        // Calculate today's schedule (mock for now)
        const todaySchedule = teacher.courseOfferings.map((offering: any) => ({
            courseId: offering.course.id,
            courseName: offering.course.name,
            courseCode: offering.course.code,
            section: offering.sections?.section_name || 'Unknown',
            time: '10:00 AM', // Mock time - should come from timetable
            duration: '1 hour',
            studentsEnrolled: offering.enrollments.length
        }));

        const dashboardData = {
            teacher: {
                id: teacher.id,
                name: teacher.user.name,
                email: teacher.user.email,
                phone: teacher.user.phone,
                photoUrl: teacher.user.photoUrl,
                department: teacher.department?.name || 'Unknown',
                departmentCode: teacher.department?.code || 'N/A',
                college: teacher.colleges?.name || 'Unknown',
                collegeCode: teacher.colleges?.code || 'N/A'
            },
            statistics: {
                totalCourses: stats.totalCourses,
                totalStudents: stats.totalStudents,
                totalSessions: stats.totalSessions,
                averageAttendance: Math.round(averageAttendance * 10) / 10
            },
            recentSessions: recentAttendanceSessions.map(session => ({
                id: session.id,
                date: session.classDate,
                courseName: session.offering.course.name,
                courseCode: session.offering.course.code,
                section: 'Section', // Could be improved
                topic: session.syllabusCovered || 'No topic recorded',
                attendanceCount: session.totalStudents,
                presentCount: session.presentStudents
            })),
            todaySchedule
        };

        res.json({
            status: 'success',
            data: dashboardData
        });

    } catch (error) {
        console.error('Teacher dashboard error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to load teacher dashboard',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export default router;
