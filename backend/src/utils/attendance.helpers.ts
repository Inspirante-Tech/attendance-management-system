/**
 * Helper functions for attendance-related operations
 * These functions extract common logic to improve code readability and reusability
 */

import { PrismaClient } from '@prisma/client';
import { AttendanceRecordData, AttendanceStatus } from '../types/attendance.types';

/**
 * Get list of course IDs that a user has access to
 * @param prisma - Prisma client instance
 * @param userId - User ID
 * @param userRoles - Array of user roles
 * @returns Array of accessible course IDs
 */
export async function getAccessibleCourseIds(
    prisma: PrismaClient,
    userId: string,
    userRoles: string[]
): Promise<string[]> {
    // Admin can see all courses
    if (userRoles.includes('admin')) {
        const allCourses = await prisma.course.findMany({
            select: { id: true }
        });
        return allCourses.map((c: { id: string }) => c.id);
    }

    // Teacher can only see courses they're assigned to
    if (userRoles.includes('teacher')) {
        const teacher = await prisma.teacher.findUnique({
            where: { userId },
            include: {
                courseOfferings: {
                    include: {
                        course: true
                    }
                }
            }
        });

        if (teacher) {
            const courseIds = teacher.courseOfferings.map((offering: any) => offering.course.id);
            return [...new Set(courseIds)] as string[];
        }
    }

    // No access for other roles
    return [];
}

/**
 * Build course filter for Prisma queries based on user access
 * @param allowedCourseIds - Array of course IDs the user can access
 * @param requestedCourseId - Specific course ID requested (optional)
 * @returns Prisma where clause for course filtering
 */
export function buildCourseFilter(
    allowedCourseIds: string[],
    requestedCourseId?: string
): any {
    // If specific course requested, verify user has access to it
    if (requestedCourseId) {
        if (allowedCourseIds.includes(requestedCourseId)) {
            return { id: requestedCourseId };
        } else {
            // User is not allowed to view this course - return empty filter
            return { id: 'no-access' };
        }
    }

    // Return filter for all allowed courses
    if (allowedCourseIds.length > 0) {
        return { id: { in: allowedCourseIds } };
    }

    // User has no course access - return empty filter
    return { id: 'no-access' };
}

/**
 * Transform student and enrollment data into attendance record format
 * @param student - Student with enrollment and attendance data
 * @param attendanceMap - Map of studentId to attendance record
 * @param date - Date for which attendance is being recorded
 * @returns Formatted attendance record
 */
export function transformToAttendanceRecord(
    student: any,
    attendanceMap: Map<string, any>,
    date: string
): AttendanceRecordData {
    const attendanceRecord = attendanceMap.get(student.id);

    // If student has attendance record, use it
    if (attendanceRecord) {
        return {
            id: attendanceRecord.id,
            date: attendanceRecord.attendance?.classDate?.toISOString().split('T')[0] || date,
            studentId: student.id,
            usn: student.usn || '',
            student_name: student.user?.name || '',
            status: attendanceRecord.status as AttendanceStatus,
            courseId: attendanceRecord.attendance?.offering?.course?.id,
            courseName: attendanceRecord.attendance?.offering?.course?.name,
            courseCode: attendanceRecord.attendance?.offering?.course?.code,
            periodNumber: attendanceRecord.attendance?.periodNumber,
            sectionName: student.sections?.section_name || 'Section A'
        };
    }

    // Student doesn't have attendance record yet - show as "not marked"
    const primaryEnrollment = student.enrollments?.[0];
    return {
        id: `pending-${student.id}`,
        date: date,
        studentId: student.id,
        usn: student.usn || '',
        student_name: student.user?.name || '',
        status: 'not_marked',
        courseId: primaryEnrollment?.offering?.course?.id || null,
        courseName: primaryEnrollment?.offering?.course?.name || 'No Course',
        courseCode: primaryEnrollment?.offering?.course?.code || 'N/A',
        periodNumber: 1,
        sectionName: student.sections?.section_name || 'Section A'
    };
}

/**
 * Find or create a suitable course offering for attendance
 * @param prisma - Prisma client instance
 * @param courseId - Course ID (optional)
 * @param studentId - Student ID
 * @returns Course offering ID or null
 */
export async function findCourseOfferingForAttendance(
    prisma: PrismaClient,
    courseId: string | undefined,
    studentId: string
): Promise<string | null> {
    // If courseId is specified, try to find that course offering
    if (courseId) {
        const courseOffering = await prisma.courseOffering.findFirst({
            where: { courseId }
        });
        if (courseOffering) {
            return courseOffering.id;
        }
    }

    // Fall back to any course offering the student is enrolled in
    const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
            enrollments: {
                include: { offering: true },
                take: 1
            }
        }
    });

    return student?.enrollments?.[0]?.offering?.id || null;
}

/**
 * Find or create attendance session for a date and offering
 * @param prisma - Prisma client instance
 * @param date - Date for attendance
 * @param offeringId - Course offering ID
 * @returns Attendance session ID
 */
export async function findOrCreateAttendanceSession(
    prisma: PrismaClient,
    date: Date,
    offeringId: string
): Promise<string> {
    // Check if attendance session already exists
    const existingSession = await prisma.attendance.findFirst({
        where: {
            classDate: date,
            offeringId: offeringId
        }
    });

    if (existingSession) {
        return existingSession.id;
    }

    // Create new attendance session
    const newSession = await prisma.attendance.create({
        data: {
            classDate: date,
            offeringId: offeringId,
            periodNumber: 1
        }
    });

    return newSession.id;
}

/**
 * Validate attendance status value
 * @param status - Status to validate
 * @returns True if valid, false otherwise
 */
export function isValidAttendanceStatus(status: string): status is 'present' | 'absent' {
    return status === 'present' || status === 'absent';
}
