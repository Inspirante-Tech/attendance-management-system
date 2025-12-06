"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/teacher/attendanceRoutes.ts
const express_1 = require("express");
const database_1 = __importDefault(require("../../lib/database"));
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
// Get attendance by date for teacher's courses
router.get('/attendance', auth_1.authenticateToken, async (req, res) => {
    try {
        const prisma = database_1.default.getInstance();
        const userId = req.user?.id;
        const { date, courseId } = req.query;
        if (!userId) {
            return res.status(401).json({ status: 'error', message: 'User authentication required' });
        }
        if (!date) {
            return res.status(400).json({ status: 'error', message: 'Date parameter is required' });
        }
        const teacher = await prisma.teacher.findFirst({ where: { userId } });
        if (!teacher) {
            return res.status(403).json({ status: 'error', message: 'Teacher access required' });
        }
        const whereClause = {
            teacherId: teacher.id,
            classDate: new Date(date),
            status: 'confirmed'
        };
        if (courseId) {
            let courseOffering = await prisma.courseOffering.findFirst({
                where: { id: courseId, teacherId: teacher.id }
            });
            if (!courseOffering) {
                courseOffering = await prisma.courseOffering.findFirst({
                    where: { courseId: courseId, teacherId: teacher.id }
                });
            }
            if (!courseOffering) {
                return res.status(403).json({ status: 'error', message: 'Access denied to this course' });
            }
            whereClause.offeringId = courseOffering.id;
        }
        const attendanceSessions = await prisma.attendance.findMany({
            where: whereClause,
            include: {
                attendanceRecords: {
                    include: {
                        student: {
                            include: {
                                user: { select: { id: true, name: true, email: true } }
                            }
                        }
                    }
                },
                offering: {
                    include: {
                        course: { select: { id: true, name: true, code: true } },
                        sections: { select: { section_name: true } }
                    }
                }
            }
        });
        const formattedData = attendanceSessions.map((session) => ({
            attendanceId: session.id,
            date: session.classDate,
            period: session.periodNumber,
            course: {
                id: session.offering.course.id,
                name: session.offering.course.name,
                code: session.offering.course.code
            },
            section: session.offering.sections?.section_name,
            syllabusCovered: session.syllabusCovered,
            records: session.attendanceRecords.map((record) => ({
                recordId: record.id,
                studentId: record.studentId,
                student: {
                    id: record.student.id,
                    name: record.student.user.name,
                    email: record.student.user.email,
                    usn: record.student.usn
                },
                status: record.status
            }))
        }));
        res.json({ status: 'success', data: formattedData });
    }
    catch (error) {
        console.error('Error fetching attendance data:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch attendance data',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Update individual student attendance (creates records automatically if they don't exist)
router.put('/attendance/student', auth_1.authenticateToken, async (req, res) => {
    try {
        const prisma = database_1.default.getInstance();
        const userId = req.user?.id;
        const { studentId, courseId, date, status } = req.body;
        if (!userId) {
            return res.status(401).json({ status: 'error', message: 'User authentication required' });
        }
        if (!studentId || !courseId || !date || !status) {
            return res.status(400).json({ status: 'error', message: 'studentId, courseId, date, and status are required' });
        }
        if (!['present', 'absent', 'unmarked'].includes(status)) {
            return res.status(400).json({ status: 'error', message: 'Status must be present, absent, or unmarked' });
        }
        const teacher = await prisma.teacher.findFirst({ where: { userId } });
        if (!teacher) {
            return res.status(403).json({ status: 'error', message: 'Teacher access required' });
        }
        let courseOffering = await prisma.courseOffering.findFirst({ where: { id: courseId, teacherId: teacher.id } });
        if (!courseOffering) {
            courseOffering = await prisma.courseOffering.findFirst({ where: { courseId, teacherId: teacher.id } });
        }
        if (!courseOffering) {
            return res.status(403).json({ status: 'error', message: 'Access denied to this course' });
        }
        const enrollment = await prisma.studentEnrollment.findFirst({
            where: { studentId, offeringId: courseOffering.id }
        });
        if (!enrollment) {
            return res.status(400).json({ status: 'error', message: 'Student is not enrolled in this course' });
        }
        const classDate = new Date(date);
        let attendanceSession = await prisma.attendance.findFirst({
            where: { offeringId: courseOffering.id, classDate, teacherId: teacher.id }
        });
        if (!attendanceSession) {
            attendanceSession = await prisma.attendance.create({
                data: {
                    offeringId: courseOffering.id,
                    teacherId: teacher.id,
                    classDate,
                    periodNumber: 1,
                    syllabusCovered: '',
                    status: 'confirmed'
                }
            });
        }
        let attendanceRecord = await prisma.attendanceRecord.findFirst({
            where: { attendanceId: attendanceSession.id, studentId }
        });
        if (!attendanceRecord) {
            if (status !== 'unmarked') {
                attendanceRecord = await prisma.attendanceRecord.create({
                    data: { attendanceId: attendanceSession.id, studentId, status }
                });
            }
        }
        else {
            if (status === 'unmarked') {
                await prisma.attendanceRecord.delete({ where: { id: attendanceRecord.id } });
                attendanceRecord = null;
            }
            else {
                attendanceRecord = await prisma.attendanceRecord.update({
                    where: { id: attendanceRecord.id },
                    data: { status }
                });
            }
        }
        res.json({
            status: 'success',
            message: `Student attendance updated to ${status}`,
            data: {
                studentId,
                status: attendanceRecord ? attendanceRecord.status : 'unmarked',
                date,
                sessionId: attendanceSession.id,
                recordId: attendanceRecord ? attendanceRecord.id : null
            }
        });
    }
    catch (error) {
        console.error('Error updating student attendance:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update student attendance',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Create attendance record for teacher's courses (single student)
router.post('/attendance', auth_1.authenticateToken, async (req, res) => {
    try {
        const prisma = database_1.default.getInstance();
        const userId = req.user?.id;
        const { studentId, date, status, courseId } = req.body;
        if (!userId) {
            return res.status(401).json({ status: 'error', message: 'User authentication required' });
        }
        if (!studentId || !date || !status) {
            return res.status(400).json({ status: 'error', message: 'studentId, date, and status are required' });
        }
        const teacher = await prisma.teacher.findFirst({ where: { userId } });
        if (!teacher) {
            return res.status(403).json({ status: 'error', message: 'Teacher access required' });
        }
        let offeringId = null;
        if (courseId) {
            let courseOffering = await prisma.courseOffering.findFirst({
                where: { id: courseId, teacherId: teacher.id }
            });
            if (!courseOffering) {
                courseOffering = await prisma.courseOffering.findFirst({
                    where: { courseId, teacherId: teacher.id }
                });
            }
            if (!courseOffering) {
                return res.status(403).json({ status: 'error', message: 'Access denied to this course' });
            }
            offeringId = courseOffering.id;
        }
        const enrollment = await prisma.studentEnrollment.findFirst({
            where: {
                studentId,
                offering: { teacherId: teacher.id, ...(offeringId && { id: offeringId }) }
            },
            include: { offering: true }
        });
        if (!enrollment) {
            return res.status(403).json({ status: 'error', message: 'Access denied: Student not enrolled in your courses' });
        }
        const attendanceDate = new Date(date);
        let attendanceSession = await prisma.attendance.findFirst({
            where: { offeringId: enrollment.offeringId, teacherId: teacher.id, classDate: attendanceDate, status: 'confirmed' }
        });
        if (!attendanceSession) {
            attendanceSession = await prisma.attendance.create({
                data: {
                    offeringId: enrollment.offeringId,
                    teacherId: teacher.id,
                    classDate: attendanceDate,
                    periodNumber: 1,
                    status: 'confirmed',
                    syllabusCovered: ''
                }
            });
        }
        const existingRecord = await prisma.attendanceRecord.findFirst({
            where: { attendanceId: attendanceSession.id, studentId }
        });
        let attendanceRecord;
        if (existingRecord) {
            attendanceRecord = await prisma.attendanceRecord.update({ where: { id: existingRecord.id }, data: { status } });
        }
        else {
            attendanceRecord = await prisma.attendanceRecord.create({ data: { attendanceId: attendanceSession.id, studentId, status } });
        }
        res.json({
            status: 'success',
            data: {
                recordId: attendanceRecord.id,
                attendanceId: attendanceSession.id,
                studentId,
                status,
                date: attendanceDate
            }
        });
    }
    catch (error) {
        console.error('Error creating attendance record:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create attendance record',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Update attendance record for teacher's courses
router.put('/attendance/:attendanceRecordId', auth_1.authenticateToken, async (req, res) => {
    try {
        const prisma = database_1.default.getInstance();
        const userId = req.user?.id;
        const { attendanceRecordId } = req.params;
        const { status } = req.body;
        if (!userId) {
            return res.status(401).json({ status: 'error', message: 'User authentication required' });
        }
        if (!status) {
            return res.status(400).json({ status: 'error', message: 'Status is required' });
        }
        const teacher = await prisma.teacher.findFirst({ where: { userId } });
        if (!teacher) {
            return res.status(403).json({ status: 'error', message: 'Teacher access required' });
        }
        const attendanceRecord = await prisma.attendanceRecord.findFirst({
            where: { id: attendanceRecordId },
            include: { attendance: { include: { offering: true } } }
        });
        if (!attendanceRecord) {
            return res.status(404).json({ status: 'error', message: 'Attendance record not found' });
        }
        if (!attendanceRecord.attendance || attendanceRecord.attendance.teacherId !== teacher.id) {
            return res.status(403).json({ status: 'error', message: 'Access denied: This attendance record does not belong to your courses' });
        }
        const updatedRecord = await prisma.attendanceRecord.update({ where: { id: attendanceRecordId }, data: { status } });
        res.json({ status: 'success', data: { recordId: updatedRecord.id, studentId: updatedRecord.studentId, status: updatedRecord.status } });
    }
    catch (error) {
        console.error('Error updating attendance record:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update attendance record',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Create attendance session for teacher's course
router.post('/attendance/session', auth_1.authenticateToken, async (req, res) => {
    try {
        const prisma = database_1.default.getInstance();
        const userId = req.user?.id;
        const { courseId, date, periodNumber, syllabusCovered } = req.body;
        if (!userId) {
            return res.status(401).json({ status: 'error', message: 'User authentication required' });
        }
        if (!courseId || !date) {
            return res.status(400).json({ status: 'error', message: 'courseId and date are required' });
        }
        const teacher = await prisma.teacher.findFirst({ where: { userId } });
        if (!teacher) {
            return res.status(403).json({ status: 'error', message: 'Teacher access required' });
        }
        let courseOffering = await prisma.courseOffering.findFirst({ where: { id: courseId, teacherId: teacher.id } });
        if (!courseOffering) {
            courseOffering = await prisma.courseOffering.findFirst({ where: { courseId, teacherId: teacher.id } });
        }
        if (!courseOffering) {
            return res.status(403).json({ status: 'error', message: 'Access denied to this course' });
        }
        const classDate = new Date(date);
        const existingSession = await prisma.attendance.findFirst({
            where: { offeringId: courseOffering.id, classDate, teacherId: teacher.id, periodNumber: periodNumber || 1 }
        });
        if (existingSession) {
            return res.status(400).json({ status: 'error', message: 'Attendance session already exists for this date and period' });
        }
        const attendanceSession = await prisma.attendance.create({
            data: {
                offeringId: courseOffering.id,
                teacherId: teacher.id,
                classDate,
                periodNumber: periodNumber || 1,
                syllabusCovered: syllabusCovered || '',
                status: 'confirmed'
            }
        });
        const enrollments = await prisma.studentEnrollment.findMany({
            where: { offeringId: courseOffering.id },
            include: { student: { include: { user: { select: { id: true, name: true, email: true } } } } }
        });
        const attendanceRecords = await Promise.all(enrollments.map(enrollment => prisma.attendanceRecord.create({
            data: { attendanceId: attendanceSession.id, studentId: enrollment.studentId, status: 'absent' }
        })));
        const sessionWithRecords = await prisma.attendance.findUnique({
            where: { id: attendanceSession.id },
            include: {
                attendanceRecords: { include: { student: { include: { user: { select: { id: true, name: true, email: true } } } } } },
                offering: { include: { course: { select: { id: true, name: true, code: true } } } }
            }
        });
        res.json({
            status: 'success',
            message: `Attendance session created with ${attendanceRecords.length} students`,
            data: {
                sessionId: attendanceSession.id,
                date: attendanceSession.classDate,
                period: attendanceSession.periodNumber,
                course: sessionWithRecords?.offering ? {
                    id: sessionWithRecords.offering.course.id,
                    name: sessionWithRecords.offering.course.name,
                    code: sessionWithRecords.offering.course.code
                } : null,
                studentsCount: attendanceRecords.length,
                records: sessionWithRecords?.attendanceRecords.map(record => ({
                    id: record.id,
                    studentId: record.studentId,
                    usn: record.student?.usn || record.student?.user?.email || 'N/A',
                    student_name: record.student?.user?.name || 'Unknown',
                    status: record.status
                })) || []
            }
        });
    }
    catch (error) {
        console.error('Error creating attendance session:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create attendance session',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Get student attendance for a specific course and date (final version)
router.get('/attendance/students', auth_1.authenticateToken, async (req, res) => {
    try {
        const prisma = database_1.default.getInstance();
        const userId = req.user?.id;
        const { courseId, date } = req.query;
        if (!userId) {
            return res.status(401).json({ status: 'error', message: 'User authentication required' });
        }
        if (!courseId || !date) {
            return res.status(400).json({ status: 'error', message: 'courseId and date are required' });
        }
        const teacher = await prisma.teacher.findFirst({ where: { userId } });
        if (!teacher) {
            return res.status(403).json({ status: 'error', message: 'Teacher access required' });
        }
        let courseOffering = await prisma.courseOffering.findFirst({
            where: { id: courseId, teacherId: teacher.id },
            include: { course: { select: { id: true, name: true, code: true } } }
        });
        if (!courseOffering) {
            courseOffering = await prisma.courseOffering.findFirst({
                where: { courseId: courseId, teacherId: teacher.id },
                include: { course: { select: { id: true, name: true, code: true } } }
            });
        }
        if (!courseOffering) {
            return res.status(403).json({ status: 'error', message: 'Access denied to this course' });
        }
        const classDate = new Date(date);
        const enrollments = await prisma.studentEnrollment.findMany({
            where: { offeringId: courseOffering.id },
            include: { student: { include: { user: { select: { id: true, name: true } } } } }
        });
        const attendanceSession = await prisma.attendance.findFirst({
            where: { offeringId: courseOffering.id, classDate, teacherId: teacher.id },
            include: { attendanceRecords: true }
        });
        const studentAttendanceData = enrollments.map(enrollment => {
            const attendanceRecord = attendanceSession?.attendanceRecords.find(record => record.studentId === enrollment.studentId);
            return {
                studentId: enrollment.studentId,
                usn: enrollment.student?.usn || '',
                student_name: enrollment.student?.user?.name || 'Unknown',
                status: attendanceRecord ? attendanceRecord.status : 'unmarked',
                attendanceRecordId: attendanceRecord?.id,
                courseId: courseOffering.course.id,
                courseName: `${courseOffering.course.code} - ${courseOffering.course.name}`
            };
        });
        res.json({ status: 'success', data: studentAttendanceData });
    }
    catch (error) {
        console.error('Error getting student attendance:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get student attendance',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
