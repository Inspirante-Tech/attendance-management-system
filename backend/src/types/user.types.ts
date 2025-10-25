/**
 * Type definitions for user management operations
 */

import { UserRole } from './common.types';

/**
 * Create user request body
 */
export interface CreateUserRequest {
    name: string;
    username: string;
    email?: string;
    phone?: string;
    password?: string;
    role: UserRole;
    // Student-specific fields
    departmentId?: string;
    year?: number;
    section?: string;
    usn?: string;
    collegeId?: string;
}

/**
 * Update user request body
 */
export interface UpdateUserRequest {
    name: string;
    username: string;
    email?: string;
    phone?: string;
    role: UserRole;
    // Student-specific fields
    departmentId?: string;
    year?: number;
    section?: string;
    usn?: string;
    collegeId?: string;
}

/**
 * Query parameters for fetching users
 */
export interface GetUsersParams {
    role?: UserRole;
}

/**
 * Deletion result with dependencies information
 */
export interface DeleteResult {
    success: boolean;
    hasDependencies: boolean;
    dependencies?: {
        enrollments?: number;
        attendanceRecords?: number;
        courseOfferings?: number;
        attendances?: number;
    };
    message: string;
}
