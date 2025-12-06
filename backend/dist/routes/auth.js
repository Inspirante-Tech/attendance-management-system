"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/auth.ts
/**
 * Authentication routes
 * Handles login, logout, token refresh, and password management
 */
const express_1 = require("express");
const database_1 = __importDefault(require("../lib/database"));
const auth_1 = require("../middleware/auth");
const auth_helpers_1 = require("../utils/auth.helpers");
const router = (0, express_1.Router)();
console.log('=== AUTH ROUTES LOADED ===');
/**
 * POST /login
 * Authenticates user and returns JWT token
 * Body: { username, password, role? }
 */
/**
 * POST /login
 * Authenticates user and returns JWT token
 * Body: { username, password, role? }
 */
router.post('/login', async (req, res) => {
    try {
        const { username, password, role } = req.body;
        // Validate credentials
        const validationError = (0, auth_helpers_1.validateLoginCredentials)(username, password);
        if (validationError) {
            return res.status(400).json({
                status: 'error',
                error: validationError,
                code: 'MISSING_CREDENTIALS'
            });
        }
        const prisma = database_1.default.getInstance();
        // Find user by username or email
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { username: username },
                    { email: username }
                ]
            },
            include: {
                userRoles: true,
                student: {
                    include: {
                        colleges: true,
                        departments: true,
                        sections: true
                    }
                },
                teacher: {
                    include: {
                        colleges: true,
                        department: true
                    }
                },
                admin: true
            }
        });
        if (!user) {
            return res.status(401).json({
                status: 'error',
                error: 'Invalid credentials',
                code: 'INVALID_CREDENTIALS'
            });
        }
        // Validate password (supports legacy plain text)
        const passwordValid = await (0, auth_helpers_1.validatePassword)(password, user.passwordHash);
        if (!passwordValid) {
            return res.status(401).json({
                status: 'error',
                error: 'Invalid credentials',
                code: 'INVALID_CREDENTIALS'
            });
        }
        // Migrate legacy password if needed
        if (password === user.passwordHash) {
            await (0, auth_helpers_1.migrateLegacyPassword)(prisma, user.id, password);
        }
        // Check role access
        const userRoles = user.userRoles.map((r) => r.role);
        if (role && !(0, auth_helpers_1.hasRoleAccess)(userRoles, role)) {
            return res.status(403).json({
                status: 'error',
                error: `Access denied. You don't have ${role} privileges`,
                code: 'ROLE_ACCESS_DENIED',
                userRoles,
                requestedRole: role
            });
        }
        // Generate JWT token
        const token = (0, auth_helpers_1.generateToken)(user.id, user.username, userRoles, auth_1.JWT_SECRET);
        // Build user profile
        const profile = (0, auth_helpers_1.buildUserProfile)(user, userRoles);
        // Prepare response data
        const responseData = {
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                name: user.name,
                phone: user.phone,
                roles: userRoles,
                primaryRole: role || userRoles[0],
                profile
            },
            token,
            expiresIn: '24h'
        };
        res.json({
            status: 'success',
            message: 'Login successful',
            data: responseData,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            status: 'error',
            error: 'Login failed',
            code: 'LOGIN_ERROR',
            timestamp: new Date().toISOString()
        });
    }
});
/**
 * GET /me
 * Returns the current authenticated user's profile
 */
router.get('/me', auth_1.authenticateToken, async (req, res) => {
    try {
        const prisma = database_1.default.getInstance();
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                userRoles: true,
                student: {
                    include: {
                        colleges: true,
                        departments: true,
                        sections: true,
                        enrollments: {
                            include: {
                                offering: {
                                    include: {
                                        course: true,
                                        academic_years: true
                                    }
                                }
                            }
                        }
                    }
                },
                teacher: {
                    include: {
                        colleges: true,
                        department: true,
                        courseOfferings: {
                            include: {
                                course: true,
                                sections: true,
                                academic_years: true
                            }
                        }
                    }
                },
                admin: true
            }
        });
        if (!user) {
            return res.status(404).json({
                status: 'error',
                error: 'User not found',
                code: 'USER_NOT_FOUND'
            });
        }
        const userRoles = user.userRoles.map((r) => r.role);
        res.json({
            status: 'success',
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
                name: user.name,
                phone: user.phone,
                roles: userRoles,
                student: user.student,
                teacher: user.teacher,
                admin: user.admin,
                createdAt: user.createdAt
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            status: 'error',
            error: 'Failed to get user profile',
            code: 'PROFILE_ERROR'
        });
    }
});
/**
 * POST /refresh
 * Generates a new JWT token for the authenticated user
 */
router.post('/refresh', auth_1.authenticateToken, async (req, res) => {
    try {
        // Generate new token with same user data
        const token = (0, auth_helpers_1.generateToken)(req.user.id, req.user.username, req.user.roles, auth_1.JWT_SECRET);
        res.json({
            status: 'success',
            data: {
                token,
                expiresIn: '24h'
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Token refresh error:', error);
        res.status(500).json({
            status: 'error',
            error: 'Failed to refresh token',
            code: 'REFRESH_ERROR'
        });
    }
});
/**
 * POST /logout
 * Logs out user (client-side token deletion)
 * Note: Could implement token blacklist for additional security
 */
router.post('/logout', auth_1.authenticateToken, (req, res) => {
    res.json({
        status: 'success',
        message: 'Logged out successfully',
        timestamp: new Date().toISOString()
    });
});
/**
 * POST /change-password
 * Changes the user's password
 * Body: { currentPassword, newPassword }
 */
router.post('/change-password', auth_1.authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        // Validate request
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                status: 'error',
                error: 'Current password and new password are required',
                code: 'MISSING_PASSWORDS'
            });
        }
        // Validate new password strength
        const strengthError = (0, auth_helpers_1.validatePasswordStrength)(newPassword);
        if (strengthError) {
            return res.status(400).json({
                status: 'error',
                error: strengthError,
                code: 'PASSWORD_TOO_SHORT'
            });
        }
        const prisma = database_1.default.getInstance();
        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });
        if (!user) {
            return res.status(404).json({
                status: 'error',
                error: 'User not found',
                code: 'USER_NOT_FOUND'
            });
        }
        // Verify current password
        const currentPasswordValid = await (0, auth_helpers_1.validatePassword)(currentPassword, user.passwordHash);
        if (!currentPasswordValid) {
            return res.status(401).json({
                status: 'error',
                error: 'Current password is incorrect',
                code: 'INVALID_CURRENT_PASSWORD'
            });
        }
        // Hash and update new password
        const hashedNewPassword = await (0, auth_helpers_1.hashPassword)(newPassword);
        await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash: hashedNewPassword }
        });
        res.json({
            status: 'success',
            message: 'Password changed successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            status: 'error',
            error: 'Failed to change password',
            code: 'PASSWORD_CHANGE_ERROR'
        });
    }
});
/**
 * POST /verify
 * Verifies if the JWT token is valid
 * Returns user information if valid
 */
router.post('/verify', auth_1.authenticateToken, (req, res) => {
    res.json({
        status: 'success',
        message: 'Token is valid',
        data: {
            user: req.user
        },
        timestamp: new Date().toISOString()
    });
});
exports.default = router;
