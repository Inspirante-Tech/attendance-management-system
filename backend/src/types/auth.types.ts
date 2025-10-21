/**
 * Type definitions for authentication operations
 */

/**
 * Login request body
 */
export interface LoginRequest {
    username: string;
    password: string;
    role?: string;
}

/**
 * Change password request body
 */
export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

/**
 * User profile data for different roles
 */
export interface StudentProfile {
    type: 'student';
    usn: string | null;
    semester: number;
    batchYear: number;
    college: {
        id: string;
        name: string;
        code: string;
    } | null;
    department: {
        id: string;
        name: string;
        code: string;
    } | null;
    section: {
        id: string;
        name: string;
    } | null;
}

export interface TeacherProfile {
    type: 'teacher';
    college: {
        id: string;
        name: string;
        code: string;
    } | null;
    department: {
        id: string;
        name: string;
        code: string;
    } | null;
}

export interface AdminProfile {
    type: 'admin';
}

export type UserProfile = StudentProfile | TeacherProfile | AdminProfile | null;

/**
 * Login response data
 */
export interface LoginResponseData {
    user: {
        id: string;
        username: string;
        email: string | null;
        name: string;
        phone: string | null;
        roles: string[];
        primaryRole: string;
        profile: UserProfile;
    };
    token: string;
    expiresIn: string;
}

/**
 * Token refresh response data
 */
export interface TokenRefreshData {
    token: string;
    expiresIn: string;
}
