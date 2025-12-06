"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/teacher/courseRoutes.ts
const express_1 = require("express");
const database_1 = __importDefault(require("../../lib/database"));
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
/**
 * GET /api/teacher/courses
 * Get all courses assigned to teacher
 */
router.get('/courses', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ status: 'error', message: 'User not authenticated' });
        }
        const prisma = database_1.default.getInstance();
        const teacher = await prisma.teacher.findUnique({
            where: { userId },
            include: {
                courseOfferings: {
                    include: {
                        course: {
                            include: {
                                department: true
                            }
                        },
                        sections: true,
                        academic_years: true,
                        enrollments: {
                            include: {
                                student: {
                                    include: {
                                        user: {
                                            select: {
                                                name: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        if (!teacher) {
            return res.status(404).json({ status: 'error', message: 'Teacher not found' });
        }
        const coursesData = teacher.courseOfferings.map(offering => ({
            offeringId: offering.id,
            course: {
                id: offering.course.id,
                name: offering.course.name,
                code: offering.course.code,
                type: offering.course.type,
                department: offering.course.department?.code || 'Unknown',
                departmentName: offering.course.department?.name || 'Unknown'
            },
            section: offering.sections ? {
                id: offering.sections.section_id,
                name: offering.sections.section_name
            } : null,
            academicYear: offering.academic_years?.year_name || 'Unknown',
            semester: offering.semester || 0,
            enrolledStudents: offering.enrollments.length,
            students: offering.enrollments.map(enrollment => ({
                id: enrollment.student?.id || '',
                name: enrollment.student?.user?.name || 'Unknown',
                usn: enrollment.student?.usn || 'N/A'
            }))
        }));
        res.json({
            status: 'success',
            data: coursesData
        });
    }
    catch (error) {
        console.error('Teacher courses error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to load teacher courses',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
/**
 * GET /api/teacher/courses/:offeringId/students
 * Get students for a specific course offering
 */
router.get('/courses/:offeringId/students', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { offeringId } = req.params;
        if (!userId) {
            return res.status(401).json({ status: 'error', message: 'User not authenticated' });
        }
        const prisma = database_1.default.getInstance();
        // Verify teacher has access to this course offering
        const teacher = await prisma.teacher.findUnique({
            where: { userId },
            include: {
                courseOfferings: {
                    where: { id: offeringId }
                }
            }
        });
        if (!teacher || teacher.courseOfferings.length === 0) {
            return res.status(403).json({ status: 'error', message: 'Access denied to this course' });
        }
        // Get students enrolled in the course offering
        const enrollments = await prisma.studentEnrollment.findMany({
            where: { offeringId },
            include: {
                student: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true,
                                phone: true
                            }
                        },
                        departments: true,
                        sections: true
                    }
                },
                offering: {
                    include: {
                        course: true
                    }
                }
            }
        });
        const studentsData = enrollments.map(enrollment => ({
            enrollmentId: enrollment.id,
            student: {
                id: enrollment.student?.id || '',
                usn: enrollment.student?.usn || 'N/A',
                name: enrollment.student?.user?.name || 'Unknown',
                email: enrollment.student?.user?.email || 'N/A',
                phone: enrollment.student?.user?.phone || 'N/A',
                semester: enrollment.student?.semester || 0,
                department: enrollment.student?.departments?.name || 'Unknown',
                section: enrollment.student?.sections?.section_name || 'Unknown'
            },
            course: {
                id: enrollment.offering?.course.id || '',
                name: enrollment.offering?.course.name || 'Unknown',
                code: enrollment.offering?.course.code || 'N/A'
            }
        }));
        res.json({
            status: 'success',
            data: studentsData
        });
    }
    catch (error) {
        console.error('Teacher course students error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to load course students',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
/**
 * GET /api/teacher/courses/:offeringId/statistics
 * Get course statistics for dashboard
 */
router.get('/courses/:offeringId/statistics', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { offeringId } = req.params;
        if (!userId) {
            return res.status(401).json({ status: 'error', message: 'User not authenticated' });
        }
        const prisma = database_1.default.getInstance();
        // Verify teacher has access to this course offering
        const teacher = await prisma.teacher.findUnique({
            where: { userId },
            include: {
                courseOfferings: {
                    where: { id: offeringId }
                }
            }
        });
        if (!teacher || teacher.courseOfferings.length === 0) {
            return res.status(403).json({ status: 'error', message: 'Access denied to this course' });
        }
        // Get statistics for this course offering
        const attendanceSessions = await prisma.attendance.findMany({
            where: {
                offeringId,
                teacherId: teacher.id,
                status: 'held'
            },
            include: {
                attendanceRecords: true
            }
        });
        const totalClasses = attendanceSessions.length;
        const totalAttendanceRecords = attendanceSessions.reduce((sum, session) => sum + session.attendanceRecords.length, 0);
        const totalPresentRecords = attendanceSessions.reduce((sum, session) => sum + session.attendanceRecords.filter(record => record.status === 'present').length, 0);
        const overallAttendancePercentage = totalAttendanceRecords > 0
            ? (totalPresentRecords / totalAttendanceRecords) * 100
            : 0;
        const statistics = {
            classesCompleted: totalClasses,
            totalClasses: totalClasses,
            overallAttendancePercentage: Math.round(overallAttendancePercentage * 10) / 10
        };
        res.json({
            status: 'success',
            data: statistics
        });
    }
    catch (error) {
        console.error('Course statistics error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to load course statistics',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
