"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTeacherByUserId = getTeacherByUserId;
exports.calculateDashboardStats = calculateDashboardStats;
exports.getTotalSessionsCount = getTotalSessionsCount;
exports.getRecentAttendanceSessions = getRecentAttendanceSessions;
exports.transformToSimplifiedCourseOffering = transformToSimplifiedCourseOffering;
exports.getCourseOfferingForTeacher = getCourseOfferingForTeacher;
exports.transformToStudentData = transformToStudentData;
exports.getAttendanceHistory = getAttendanceHistory;
exports.calculateAttendanceAnalytics = calculateAttendanceAnalytics;
exports.getAttendanceSession = getAttendanceSession;
exports.isMSE3Eligible = isMSE3Eligible;
exports.calculateTheoryTotal = calculateTheoryTotal;
exports.calculateLabTotal = calculateLabTotal;
exports.isValidAttendanceStatus = isValidAttendanceStatus;
exports.formatDateOnly = formatDateOnly;
// src/utils/teacher.helpers.ts
const database_1 = __importDefault(require("../lib/database"));
/**
 * Get teacher by user ID
 */
async function getTeacherByUserId(userId) {
    const prisma = database_1.default.getInstance();
    return await prisma.teacher.findUnique({
        where: { userId },
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                    phone: true,
                    photoUrl: true
                }
            },
            colleges: {
                select: {
                    id: true,
                    name: true,
                    code: true
                }
            },
            department: {
                select: {
                    id: true,
                    name: true,
                    code: true
                }
            },
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
}
/**
 * Calculate dashboard statistics for teacher
 */
function calculateDashboardStats(teacher) {
    const totalCourses = teacher.courseOfferings.length;
    const totalStudents = new Set(teacher.courseOfferings.flatMap((offering) => offering.enrollments.map((enrollment) => enrollment.student?.id)).filter(Boolean)).size;
    return {
        totalCourses,
        totalStudents,
        totalSessions: 0 // Will be fetched separately
    };
}
/**
 * Get total sessions count for teacher
 */
async function getTotalSessionsCount(teacherId) {
    const prisma = database_1.default.getInstance();
    return await prisma.attendance.count({
        where: {
            teacherId: teacherId,
            status: 'held'
        }
    });
}
/**
 * Get recent attendance sessions for teacher
 */
async function getRecentAttendanceSessions(teacherId, limit = 5) {
    const prisma = database_1.default.getInstance();
    const sessions = await prisma.attendance.findMany({
        where: { teacherId },
        include: {
            offering: {
                include: {
                    course: true,
                    enrollments: true
                }
            },
            attendanceRecords: true
        },
        orderBy: { classDate: 'desc' },
        take: limit
    });
    return sessions.map(session => {
        const totalStudents = session.offering?.enrollments.length || 0;
        const presentStudents = session.attendanceRecords.filter((record) => record.status === 'present').length;
        const attendancePercentage = totalStudents > 0
            ? Math.round((presentStudents / totalStudents) * 100)
            : 0;
        return {
            id: session.id,
            classDate: session.classDate,
            status: session.status,
            syllabusCovered: session.syllabusCovered,
            periodNumber: session.periodNumber,
            offeringId: session.offeringId,
            teacherId: session.teacherId,
            offering: {
                id: session.offering.id,
                course: {
                    name: session.offering.course.name,
                    code: session.offering.course.code
                }
            },
            totalStudents,
            presentStudents,
            attendancePercentage
        };
    });
}
/**
 * Transform course offering to simplified format
 */
function transformToSimplifiedCourseOffering(offering) {
    return {
        id: offering.id,
        courseName: offering.course.name,
        courseCode: offering.course.code,
        courseType: offering.course.type,
        credits: offering.course.credits || null,
        sections: offering.sections ? [offering.sections.name] : [],
        academicYear: offering.academic_years?.year || 'N/A',
        studentCount: offering.enrollments?.length || 0,
        department: offering.course.department.name
    };
}
/**
 * Get course offering by ID for teacher
 */
async function getCourseOfferingForTeacher(offeringId, teacherId) {
    const prisma = database_1.default.getInstance();
    return await prisma.courseOffering.findFirst({
        where: {
            id: offeringId,
            teacherId: teacherId
        },
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
                                    name: true,
                                    email: true,
                                    phone: true
                                }
                            },
                            sections: true
                        }
                    }
                },
                orderBy: {
                    student: {
                        usn: 'asc'
                    }
                }
            }
        }
    });
}
/**
 * Transform enrollment to course student data
 */
function transformToStudentData(enrollment) {
    const section = enrollment.student?.sections?.[0] || enrollment.student?.sections;
    return {
        enrollmentId: enrollment.id,
        studentId: enrollment.student.id,
        name: enrollment.student.user.name,
        usn: enrollment.student.usn,
        email: enrollment.student.user.email,
        phone: enrollment.student.user.phone,
        section: section?.name || 'N/A',
        year: section?.year || 0
    };
}
/**
 * Get attendance history for course offering
 */
async function getAttendanceHistory(offeringId, teacherId) {
    const prisma = database_1.default.getInstance();
    const sessions = await prisma.attendance.findMany({
        where: {
            offeringId: offeringId,
            teacherId: teacherId
        },
        include: {
            offering: {
                include: {
                    enrollments: true
                }
            },
            attendanceRecords: true
        },
        orderBy: {
            classDate: 'desc'
        }
    });
    return sessions.map(session => {
        const totalStudents = session.offering?.enrollments.length || 0;
        const presentCount = session.attendanceRecords.filter((record) => record.status === 'present').length;
        const absentCount = session.attendanceRecords.filter((record) => record.status === 'absent').length;
        const attendancePercentage = totalStudents > 0
            ? Math.round((presentCount / totalStudents) * 100)
            : 0;
        return {
            id: session.id,
            classDate: session.classDate,
            status: session.status,
            syllabusCovered: session.syllabusCovered,
            periodNumber: session.periodNumber,
            totalStudents,
            presentCount,
            absentCount,
            attendancePercentage
        };
    });
}
/**
 * Calculate attendance analytics for students in a course
 */
async function calculateAttendanceAnalytics(offeringId, teacherId) {
    const prisma = database_1.default.getInstance();
    // Get all attendance sessions
    const sessions = await prisma.attendance.findMany({
        where: {
            offeringId: offeringId,
            teacherId: teacherId
        }
    });
    if (sessions.length === 0) {
        return [];
    }
    const totalSessions = sessions.length;
    // Get course offering with enrollments
    const offering = await prisma.courseOffering.findUnique({
        where: { id: offeringId },
        include: {
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
    });
    if (!offering) {
        return [];
    }
    // Get attendance records for this offering
    const attendanceRecords = await prisma.attendanceRecord.groupBy({
        by: ['studentId', 'status'],
        where: {
            attendance: {
                offeringId: offeringId
            }
        },
        _count: true
    });
    return offering.enrollments.map(enrollment => {
        const studentRecords = attendanceRecords.filter(r => r.studentId === enrollment.studentId);
        const presentCount = studentRecords.find(r => r.status === 'present')?._count || 0;
        const absentCount = studentRecords.find(r => r.status === 'absent')?._count || 0;
        const attendancePercentage = totalSessions > 0
            ? Math.round((presentCount / totalSessions) * 100)
            : 0;
        return {
            studentId: enrollment.student.id,
            studentName: enrollment.student.user.name,
            usn: enrollment.student.usn,
            totalSessions,
            presentCount,
            absentCount,
            attendancePercentage
        };
    });
}
/**
 * Get attendance session by ID
 */
async function getAttendanceSession(attendanceId, teacherId) {
    const prisma = database_1.default.getInstance();
    const session = await prisma.attendance.findFirst({
        where: {
            id: attendanceId,
            teacherId: teacherId
        },
        include: {
            offering: {
                include: {
                    course: true
                }
            }
        }
    });
    if (!session) {
        return null;
    }
    return {
        id: session.id,
        classDate: session.classDate,
        status: session.status,
        syllabusCovered: session.syllabusCovered,
        periodNumber: session.periodNumber,
        offeringId: session.offeringId,
        teacherId: session.teacherId,
        offering: {
            id: session.offering.id,
            course: {
                name: session.offering.course.name,
                code: session.offering.course.code
            }
        }
    };
}
/**
 * Check if MSE3 is eligible (MSE1 + MSE2 < 20)
 */
function isMSE3Eligible(mse1, mse2) {
    const score1 = mse1 || 0;
    const score2 = mse2 || 0;
    return (score1 + score2) < 20;
}
/**
 * Calculate theory marks total
 */
function calculateTheoryTotal(mse1, mse2, mse3, assignment, see) {
    const m1 = mse1 || 0;
    const m2 = mse2 || 0;
    const m3 = mse3 || 0;
    const assgn = assignment || 0;
    const seeMarks = see || 0;
    return m1 + m2 + m3 + assgn + seeMarks;
}
/**
 * Calculate lab marks total
 */
function calculateLabTotal(cie, see) {
    const cieMarks = cie || 0;
    const seeMarks = see || 0;
    return cieMarks + seeMarks;
}
/**
 * Validate attendance status
 */
function isValidAttendanceStatus(status) {
    return ['present', 'absent', 'on-duty'].includes(status.toLowerCase());
}
/**
 * Format date to ISO string without time
 */
function formatDateOnly(date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().split('T')[0];
}
