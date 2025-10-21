// src/types/teacher.types.ts
import { AttendanceStatus } from './attendance.types';

/**
 * Teacher profile data structure
 */
export interface TeacherProfile {
    id: string;
    teacherNumber: string;
    qualification?: string | null;
    experience?: number | null;
    designation?: string | null;
    userId: string;
    departmentId?: string | null;
    user: {
        name: string;
        email: string;
        phone?: string | null;
        photoUrl?: string | null;
    };
    colleges: Array<{
        id: string;
        name: string;
        code: string;
    }>;
    department?: {
        id: string;
        name: string;
        code: string;
    } | null;
}

/**
 * Dashboard statistics for teacher
 */
export interface TeacherDashboardStats {
    totalCourses: number;
    totalStudents: number;
    totalSessions: number;
}

/**
 * Course offering with full details for teacher view
 */
export interface TeacherCourseOffering {
    id: string;
    courseId: string;
    academicYearId: string;
    course: {
        id: string;
        name: string;
        code: string;
        credits?: number | null;
        type: string | null;
        department: {
            id: string;
            name: string;
            code: string;
        };
    };
    sections: Array<{
        id: string;
        name: string;
        year: number;
    }> | null;
    academic_years: {
        id: string;
        year: string;
        startDate: Date;
        endDate: Date;
    } | null;
    enrollments: Array<{
        id: string;
        studentId: string | null;
        student?: {
            id: string;
            usn: string;
            user: {
                name: string;
            };
        } | null;
    }>;
}

/**
 * Simplified course offering for list view
 */
export interface SimplifiedCourseOffering {
    id: string;
    courseName: string;
    courseCode: string;
    courseType: string | null;
    credits: number | null;
    sections: string[];
    academicYear: string;
    studentCount: number;
    department: string;
}

/**
 * Student enrollment data for course
 */
export interface CourseStudentData {
    enrollmentId: string;
    studentId: string;
    name: string;
    usn: string;
    email?: string | null;
    phone?: string | null;
    section: string;
    year: number;
}

/**
 * Attendance session information
 */
export interface AttendanceSession {
    id: string;
    classDate: Date;
    status: string | null;
    syllabusCovered?: string | null;
    periodNumber?: number | null;
    offeringId: string | null;
    teacherId: string | null;
    offering: {
        id: string;
        course: {
            name: string;
            code: string;
        };
    };
}

/**
 * Recent attendance session with student count
 */
export interface RecentAttendanceSession extends AttendanceSession {
    totalStudents: number;
    presentStudents: number;
    attendancePercentage: number;
}

/**
 * Attendance record for a student
 */
export interface StudentAttendanceRecord {
    studentId: string;
    studentName: string;
    usn: string;
    status: AttendanceStatus;
    attendanceRecordId?: string | null;
}

/**
 * Attendance history entry
 */
export interface AttendanceHistoryEntry {
    id: string;
    classDate: Date;
    status: string | null;
    syllabusCovered?: string | null;
    periodNumber?: number | null;
    totalStudents: number;
    presentCount: number;
    absentCount: number;
    attendancePercentage: number;
}

/**
 * Student attendance analytics
 */
export interface StudentAttendanceAnalytics {
    studentId: string;
    studentName: string;
    usn: string;
    totalSessions: number;
    presentCount: number;
    absentCount: number;
    attendancePercentage: number;
}

/**
 * Course statistics
 */
export interface CourseStatistics {
    totalStudents: number;
    totalSessions: number;
    averageAttendance: number;
    topPerformers: Array<{
        name: string;
        usn: string;
        percentage: number;
    }>;
    lowAttendance: Array<{
        name: string;
        usn: string;
        percentage: number;
    }>;
}

/**
 * Request to create attendance session
 */
export interface CreateAttendanceRequest {
    offeringId: string;
    classDate: string;
    status: string;
    syllabusCovered?: string;
    periodNumber?: number;
    attendanceData: Array<{
        studentId: string;
        status: AttendanceStatus;
    }>;
}

/**
 * Request to update student attendance
 */
export interface UpdateStudentAttendanceRequest {
    studentId: string;
    classDate: string;
    offeringId: string;
    status: AttendanceStatus;
}

/**
 * Marks data for student enrollment
 */
export interface StudentMarksData {
    enrollmentId: string;
    studentId: string | null;
    studentName: string;
    usn: string;
    theoryMarks?: {
        id: string;
        mse1?: number | null;
        mse2?: number | null;
        mse3?: number | null;
        assignment?: number | null;
        see?: number | null;
        total: number;
    } | null;
    labMarks?: {
        id: string;
        cie?: number | null;
        see?: number | null;
        total: number;
    } | null;
}

/**
 * Request to update marks
 */
export interface UpdateMarksRequest {
    courseType: 'theory' | 'lab';
    mse1?: number;
    mse2?: number;
    mse3?: number;
    assignment?: number;
    see?: number;
    cie?: number;
}

/**
 * Attendance session with records
 */
export interface AttendanceSessionWithRecords {
    id: string;
    classDate: Date;
    status: string | null;
    syllabusCovered?: string | null;
    periodNumber?: number | null;
    records: StudentAttendanceRecord[];
}
