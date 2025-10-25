// src/routes/auth.ts
/**
 * Authentication routes
 * Handles login, logout, token refresh, and password management
 */
import { Router } from 'express';
import DatabaseService from '../lib/database';
import { authenticateToken, AuthenticatedRequest, JWT_SECRET } from '../middleware/auth';
import { LoginRequest, ChangePasswordRequest, LoginResponseData } from '../types/auth.types';
import { ApiResponse } from '../types/common.types';
import {
  validatePassword,
  hashPassword,
  validatePasswordStrength,
  generateToken,
  hasRoleAccess,
  buildUserProfile,
  migrateLegacyPassword,
  validateLoginCredentials
} from '../utils/auth.helpers';

const router = Router();

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
    const { username, password, role } = req.body as LoginRequest;

    // Validate credentials
    const validationError = validateLoginCredentials(username, password);
    if (validationError) {
      return res.status(400).json({
        status: 'error',
        error: validationError,
        code: 'MISSING_CREDENTIALS'
      } as ApiResponse);
    }

    const prisma = DatabaseService.getInstance();

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
      } as ApiResponse);
    }

    // Validate password (supports legacy plain text)
    const passwordValid = await validatePassword(password, user.passwordHash);

    if (!passwordValid) {
      return res.status(401).json({
        status: 'error',
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      } as ApiResponse);
    }

    // Migrate legacy password if needed
    if (password === user.passwordHash) {
      await migrateLegacyPassword(prisma, user.id, password);
    }

    // Check role access
    const userRoles = user.userRoles.map((r: any) => r.role);
    if (role && !hasRoleAccess(userRoles, role)) {
      return res.status(403).json({
        status: 'error',
        error: `Access denied. You don't have ${role} privileges`,
        code: 'ROLE_ACCESS_DENIED',
        userRoles,
        requestedRole: role
      } as ApiResponse);
    }

    // Generate JWT token
    const token = generateToken(user.id, user.username, userRoles, JWT_SECRET);

    // Build user profile
    const profile = buildUserProfile(user, userRoles);

    // Prepare response data
    const responseData: LoginResponseData = {
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
    } as ApiResponse<LoginResponseData>);

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      error: 'Login failed',
      code: 'LOGIN_ERROR',
      timestamp: new Date().toISOString()
    } as ApiResponse);
  }
});

/**
 * GET /me
 * Returns the current authenticated user's profile
 */
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const prisma = DatabaseService.getInstance();

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
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
      } as ApiResponse);
    }

    const userRoles = user.userRoles.map((r: any) => r.role);

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
    } as ApiResponse);

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      status: 'error',
      error: 'Failed to get user profile',
      code: 'PROFILE_ERROR'
    } as ApiResponse);
  }
});

/**
 * POST /refresh
 * Generates a new JWT token for the authenticated user
 */
router.post('/refresh', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    // Generate new token with same user data
    const token = generateToken(
      req.user!.id,
      req.user!.username,
      req.user!.roles,
      JWT_SECRET
    );

    res.json({
      status: 'success',
      data: {
        token,
        expiresIn: '24h'
      },
      timestamp: new Date().toISOString()
    } as ApiResponse);

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      status: 'error',
      error: 'Failed to refresh token',
      code: 'REFRESH_ERROR'
    } as ApiResponse);
  }
});

/**
 * POST /logout
 * Logs out user (client-side token deletion)
 * Note: Could implement token blacklist for additional security
 */
router.post('/logout', authenticateToken, (req: AuthenticatedRequest, res) => {
  res.json({
    status: 'success',
    message: 'Logged out successfully',
    timestamp: new Date().toISOString()
  } as ApiResponse);
});

/**
 * POST /change-password
 * Changes the user's password
 * Body: { currentPassword, newPassword }
 */
router.post('/change-password', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body as ChangePasswordRequest;

    // Validate request
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: 'error',
        error: 'Current password and new password are required',
        code: 'MISSING_PASSWORDS'
      } as ApiResponse);
    }

    // Validate new password strength
    const strengthError = validatePasswordStrength(newPassword);
    if (strengthError) {
      return res.status(400).json({
        status: 'error',
        error: strengthError,
        code: 'PASSWORD_TOO_SHORT'
      } as ApiResponse);
    }

    const prisma = DatabaseService.getInstance();

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      } as ApiResponse);
    }

    // Verify current password
    const currentPasswordValid = await validatePassword(currentPassword, user.passwordHash);

    if (!currentPasswordValid) {
      return res.status(401).json({
        status: 'error',
        error: 'Current password is incorrect',
        code: 'INVALID_CURRENT_PASSWORD'
      } as ApiResponse);
    }

    // Hash and update new password
    const hashedNewPassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashedNewPassword }
    });

    res.json({
      status: 'success',
      message: 'Password changed successfully',
      timestamp: new Date().toISOString()
    } as ApiResponse);

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      status: 'error',
      error: 'Failed to change password',
      code: 'PASSWORD_CHANGE_ERROR'
    } as ApiResponse);
  }
});

/**
 * POST /verify
 * Verifies if the JWT token is valid
 * Returns user information if valid
 */
router.post('/verify', authenticateToken, (req: AuthenticatedRequest, res) => {
  res.json({
    status: 'success',
    message: 'Token is valid',
    data: {
      user: req.user
    },
    timestamp: new Date().toISOString()
  } as ApiResponse);
});

export default router;
