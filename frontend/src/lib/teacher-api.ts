// lib/teacher-api.ts
import Cookies from 'js-cookie';

const API_BASE_URL = 'http://localhost:4000/api';

// Utility function to get auth headers
function getAuthHeaders() {
    const token = Cookies.get('auth_token');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
}

// Type definitions
export interface TeacherProfile {
    id: string;
    name: string;
    email: string;
    phone: string;
    photoUrl?: string;
    department: string;
    departmentCode: string;
    college: string;
    collegeCode: string;
}

export interface TeacherStatistics {
    totalCourses: number;
    totalStudents: number;
    totalSessions: number;
    averageAttendance: number;
}

export interface RecentSession {
    id: string;
    date: string;
    courseName: string;
    courseCode: string;
    section: string;
    topic: string;
    attendanceCount: number;
    presentCount: number;
}

export interface TodaySchedule {
    courseId: string;
    courseName: string;
    courseCode: string;
    section: string;
    time: string;
    duration: string;
    studentsEnrolled: number;
}

export interface TeacherDashboardData {
    teacher: TeacherProfile;
    statistics: TeacherStatistics;
    recentSessions: RecentSession[];
    todaySchedule: TodaySchedule[];
}

export interface CourseOffering {
    offeringId: string;
    course: {
        id: string;
        name: string;
        code: string;
        type: string;
        hasTheoryComponent: boolean;
        hasLabComponent: boolean;
        department: string;
    };
    section: {
        id: string;
        name: string;
    } | null;
    academicYear: string;
    enrolledStudents: number;
    students: Array<{
        id: string;
        name: string;
        usn: string;
    }>;
}

export interface Student {
    enrollmentId: string;
    student: {
        id: string;
        usn: string;
        name: string;
        email: string;
        phone: string;
        semester: number;
        department: string;
        section: string;
    };
    course: {
        id: string;
        name: string;
        code: string;
    };
}

export interface AttendanceRecord {
    studentId: string;
    status: 'present' | 'absent';
}

export interface AttendanceSession {
    offeringId: string;
    classDate: string;
    periodNumber?: number;
    syllabusCovered?: string;
    hoursTaken?: number;
    attendanceData: AttendanceRecord[];
}

export interface AttendanceHistory {
    id: string;
    date: string;
    periodNumber: number;
    topic: string;
    totalStudents: number;
    presentCount: number;
    absentCount: number;
    attendancePercentage: number;
}

export interface StudentAttendanceAnalytics {
    student: {
        id: string;
        usn: string;
        name: string;
        email: string;
        phone: string;
    };
    attendance: {
        totalClasses: number;
        presentCount: number;
        absentCount: number;
        attendancePercentage: number;
    };
}

// API Functions
export class TeacherAPI {

    // Get teacher dashboard data
    static async getDashboard(): Promise<TeacherDashboardData> {
        const response = await fetch(`${API_BASE_URL}/teacher/dashboard`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch dashboard: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.status !== 'success') {
            throw new Error(result.message || 'Failed to fetch dashboard data');
        }

        return result.data;
    }

    // Get teacher's courses
    static async getCourses(): Promise<CourseOffering[]> {
        const response = await fetch(`${API_BASE_URL}/teacher/courses`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch courses: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.status !== 'success') {
            throw new Error(result.message || 'Failed to fetch courses');
        }

        return result.data;
    }

    // Get students for a specific course offering
    static async getCourseStudents(offeringId: string): Promise<Student[]> {
        const response = await fetch(`${API_BASE_URL}/teacher/courses/${offeringId}/students`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch students: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.status !== 'success') {
            throw new Error(result.message || 'Failed to fetch students');
        }

        return result.data;
    }

    // Take attendance
    static async takeAttendance(attendanceData: AttendanceSession): Promise<{
        sessionId: string;
        recordsCount: number;
        presentCount: number;
        absentCount: number;
    }> {
        const response = await fetch(`${API_BASE_URL}/teacher/attendance`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(attendanceData),
        });

        if (!response.ok) {
            throw new Error(`Failed to save attendance: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.status !== 'success') {
            throw new Error(result.message || 'Failed to save attendance');
        }

        return result.data;
    }

    // Get attendance history for a course
    static async getAttendanceHistory(offeringId: string, limit: number = 10): Promise<AttendanceHistory[]> {
        const response = await fetch(`${API_BASE_URL}/teacher/courses/${offeringId}/attendance-history?limit=${limit}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch attendance history: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.status !== 'success') {
            throw new Error(result.message || 'Failed to fetch attendance history');
        }

        return result.data;
    }

    // Get student attendance analytics for a course
    static async getAttendanceAnalytics(offeringId: string): Promise<StudentAttendanceAnalytics[]> {
        const response = await fetch(`${API_BASE_URL}/teacher/courses/${offeringId}/attendance-analytics`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch attendance analytics: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.status !== 'success') {
            throw new Error(result.message || 'Failed to fetch attendance analytics');
        }

        return result.data;
    }
}
