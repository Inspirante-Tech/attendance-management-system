"use strict";
/**
 * Helper functions for authentication operations
 * Handles password validation, token generation, and user profile building
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePassword = validatePassword;
exports.hashPassword = hashPassword;
exports.validatePasswordStrength = validatePasswordStrength;
exports.generateToken = generateToken;
exports.hasRoleAccess = hasRoleAccess;
exports.buildUserProfile = buildUserProfile;
exports.migrateLegacyPassword = migrateLegacyPassword;
exports.validateLoginCredentials = validateLoginCredentials;
exports.isValidRole = isValidRole;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * Validates password against hash with support for legacy plain text passwords
 * @param password - Plain text password to validate
 * @param passwordHash - Stored password hash (or plain text for legacy)
 * @returns True if password is valid
 */
async function validatePassword(password, passwordHash) {
    try {
        // Try bcrypt first
        return await bcryptjs_1.default.compare(password, passwordHash);
    }
    catch (error) {
        // If bcrypt fails, try plain text comparison (for legacy data)
        return password === passwordHash;
    }
}
/**
 * Hashes a password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
async function hashPassword(password) {
    return await bcryptjs_1.default.hash(password, 12);
}
/**
 * Validates password strength
 * @param password - Password to validate
 * @returns Error message if invalid, null if valid
 */
function validatePasswordStrength(password) {
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
function generateToken(userId, username, roles, secret) {
    return jsonwebtoken_1.default.sign({
        userId,
        username,
        roles
    }, secret, { expiresIn: '24h' });
}
/**
 * Checks if user has requested role with analytics fallback
 * @param userRoles - Array of user's roles
 * @param requestedRole - Role being requested
 * @returns True if user has access
 */
function hasRoleAccess(userRoles, requestedRole) {
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
function buildUserProfile(user, userRoles) {
    // Student profile
    if (user.student && userRoles.includes('student')) {
        const profile = {
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
        const profile = {
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
        const profile = {
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
async function migrateLegacyPassword(prisma, userId, plainPassword) {
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
function validateLoginCredentials(username, password) {
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
function isValidRole(role) {
    const validRoles = ['admin', 'teacher', 'student', 'analytics'];
    return validRoles.includes(role);
}
