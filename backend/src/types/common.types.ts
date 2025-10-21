/**
 * Common type definitions used across the application
 */

/**
 * Standard API response structure
 */
export interface ApiResponse<T = any> {
    status: 'success' | 'error';
    data?: T;
    error?: string;
    message?: string;
    code?: string;
    count?: number;
    timestamp?: string;
}

/**
 * User roles in the system
 */
export type UserRole = 'admin' | 'teacher' | 'student' | 'analytics';

/**
 * Authenticated user information
 */
export interface AuthenticatedUser {
    id: string;
    username: string;
    email?: string;
    name: string;
    roles: UserRole[];
}

/**
 * Course type
 */
export type CourseType = 'theory' | 'lab' | 'both';

/**
 * Department information
 */
export interface DepartmentInfo {
    id: string;
    name: string;
    code: string;
}

/**
 * Section information
 */
export interface SectionInfo {
    id: string;
    name: string;
}

/**
 * Academic year information
 */
export interface AcademicYearInfo {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
    page?: number;
    limit?: number;
    offset?: number;
}

/**
 * Sort parameters
 */
export interface SortParams {
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
