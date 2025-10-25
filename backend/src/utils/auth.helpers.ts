/**
 * Helper functions for authentication operations
 * Handles password validation, token generation, and user profile building
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { UserProfile, StudentProfile, TeacherProfile, AdminProfile } from '../types/auth.types';

/**
 * Validates password against hash with support for legacy plain text passwords
 * @param password - Plain text password to validate
 * @param passwordHash - Stored password hash (or plain text for legacy)
 * @returns True if password is valid
 */
export async function validatePassword(password: string, passwordHash: string): Promise<boolean> {
    try {
        // Try bcrypt first
        return await bcrypt.compare(password, passwordHash);
    } catch (error) {
        // If bcrypt fails, try plain text comparison (for legacy data)
        return password === passwordHash;
    }
}

/**
 * Hashes a password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 12);
}

/**
 * Validates password strength
 * @param password - Password to validate
 * @returns Error message if invalid, null if valid
 */
export function validatePasswordStrength(password: string): string | null {
    if (!password) {
        return 'Password is required';
    }
    if (password.length < 6) {
        return 'Password must be at least 6 characters long';
    }
    return null;
}

/**
 * Generates JWT token for user
 * @param userId - User ID
 * @param username - Username
 * @param roles - Array of user roles
 * @param secret - JWT secret
 * @returns JWT token
 */
export function generateToken(
    userId: string,
    username: string,
    roles: string[],
    secret: string
): string {
    return jwt.sign(
        {
            userId,
            username,
            roles
        },
        secret,
        { expiresIn: '24h' }
    );
}

/**
 * Checks if user has requested role with analytics fallback
 * @param userRoles - Array of user's roles
 * @param requestedRole - Role being requested
 * @returns True if user has access
 */
export function hasRoleAccess(userRoles: string[], requestedRole: string): boolean {
    if (userRoles.includes(requestedRole)) {
        return true;
    }

    // Allow admin and teacher users to access analytics
    if (requestedRole === 'analytics') {
        return userRoles.includes('admin') || userRoles.includes('teacher');
    }

    return false;
}

/**
 * Builds user profile data based on role
 * @param user - User object with role-specific data
 * @param userRoles - Array of user roles
 * @returns Formatted user profile
 */
export function buildUserProfile(user: any, userRoles: string[]): UserProfile {
    // Student profile
    if (user.student && userRoles.includes('student')) {
        const profile: StudentProfile = {
            type: 'student',
            usn: user.student.usn,
            semester: user.student.semester,
            batchYear: user.student.batchYear,
            college: user.student.colleges ? {
                id: user.student.colleges.id,
                name: user.student.colleges.name,
                code: user.student.colleges.code
            } : null,
            department: user.student.departments ? {
                id: user.student.departments.id,
                name: user.student.departments.name,
                code: user.student.departments.code
            } : null,
            section: user.student.sections ? {
                id: user.student.sections.section_id,
                name: user.student.sections.section_name
            } : null
        };
        return profile;
    }

    // Teacher profile
    if (user.teacher && userRoles.includes('teacher')) {
        const profile: TeacherProfile = {
            type: 'teacher',
            college: user.teacher.colleges ? {
                id: user.teacher.colleges.id,
                name: user.teacher.colleges.name,
                code: user.teacher.colleges.code
            } : null,
            department: user.teacher.department ? {
                id: user.teacher.department.id,
                name: user.teacher.department.name,
                code: user.teacher.department.code
            } : null
        };
        return profile;
    }

    // Admin profile
    if (user.admin && userRoles.includes('admin')) {
        const profile: AdminProfile = {
            type: 'admin'
        };
        return profile;
    }

    return null;
}

/**
 * Migrates legacy plain text password to bcrypt hash
 * @param prisma - Prisma client instance
 * @param userId - User ID
 * @param plainPassword - Plain text password
 */
export async function migrateLegacyPassword(
    prisma: PrismaClient,
    userId: string,
    plainPassword: string
): Promise<void> {
    const hashedPassword = await hashPassword(plainPassword);
    await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: hashedPassword }
    });
}

/**
 * Validates login credentials
 * @param username - Username
 * @param password - Password
 * @returns Error message if invalid, null if valid
 */
export function validateLoginCredentials(username: string, password: string): string | null {
    if (!username || !password) {
        return 'Username and password are required';
    }
    return null;
}

/**
 * Validates role is valid
 * @param role - Role to validate
 * @returns True if valid
 */
export function isValidRole(role: string): boolean {
    const validRoles = ['admin', 'teacher', 'student', 'analytics'];
    return validRoles.includes(role);
}
