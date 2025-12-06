"use strict";
/**
 * Helper functions for user management operations
 * Handles user validation, role checks, and data formatting
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUserCreation = validateUserCreation;
exports.validateUserUpdate = validateUserUpdate;
exports.isValidUserRole = isValidUserRole;
exports.calculateSemesterFromYear = calculateSemesterFromYear;
exports.findOrCreateSection = findOrCreateSection;
exports.resolveCollegeId = resolveCollegeId;
exports.checkUserDependencies = checkUserDependencies;
exports.forceDeleteUser = forceDeleteUser;
/**
 * Validates user creation request
 * @param userData - User data from request
 * @returns Error message if invalid, null if valid
 */
function validateUserCreation(userData) {
    if (!userData.name || !userData.username || !userData.role) {
        return 'Missing required fields: name, username, role';
    }
    if (!isValidUserRole(userData.role)) {
        return 'Invalid role. Must be one of: student, teacher, admin';
    }
    return null;
}
/**
 * Validates user update request
 * @param userData - User data from request
 * @returns Error message if invalid, null if valid
 */
function validateUserUpdate(userData) {
    if (!userData.name || !userData.username || !userData.role) {
        return 'Missing required fields: name, username, role';
    }
    if (!isValidUserRole(userData.role)) {
        return 'Invalid role. Must be one of: student, teacher, admin';
    }
    return null;
}
/**
 * Checks if role is valid
 * @param role - Role to validate
 * @returns True if valid
 */
function isValidUserRole(role) {
    const validRoles = ['student', 'teacher', 'admin'];
    return validRoles.includes(role);
}
/**
 * Calculates semester from year
 * @param year - Academic year (1, 2, 3, 4)
 * @returns Semester number
 */
function calculateSemesterFromYear(year) {
    return year * 2 - 1; // 1st year = semester 1, 2nd year = semester 3, etc.
}
/**
 * Finds or creates a section
 * @param prisma - Prisma client instance
 * @param sectionName - Section name
 * @param departmentId - Department ID (optional)
 * @returns Section ID or null
 */
async function findOrCreateSection(prisma, sectionName, departmentId) {
    if (!sectionName || !sectionName.trim()) {
        return null;
    }
    // Try to find existing section
    const existingSection = await prisma.sections.findFirst({
        where: { section_name: sectionName.trim() }
    });
    if (existingSection) {
        return existingSection.section_id;
    }
    // Create new section only if we have a department
    if (departmentId) {
        const newSection = await prisma.sections.create({
            data: {
                section_name: sectionName.trim(),
                department_id: departmentId
            }
        });
        return newSection.section_id;
    }
    return null;
}
/**
 * Resolves college ID for user creation
 * @param prisma - Prisma client instance
 * @param providedCollegeId - College ID from request (optional)
 * @param departmentId - Department ID (optional)
 * @returns College ID or throws error
 */
async function resolveCollegeId(prisma, providedCollegeId, departmentId) {
    // Use provided college ID if available
    if (providedCollegeId) {
        return providedCollegeId;
    }
    // Get college from department if department ID is provided
    if (departmentId) {
        const department = await prisma.department.findUnique({
            where: { id: departmentId },
            include: { colleges: true }
        });
        if (department && department.college_id) {
            return department.college_id;
        }
    }
    // Fallback to first college
    const firstCollege = await prisma.college.findFirst();
    if (!firstCollege) {
        throw new Error('No college found in the system');
    }
    return firstCollege.id;
}
/**
 * Checks user dependencies for deletion
 * @param prisma - Prisma client instance
 * @param userId - User ID
 * @returns Delete result with dependency information
 */
async function checkUserDependencies(prisma, userId) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            student: {
                include: {
                    _count: {
                        select: {
                            enrollments: true,
                            attendanceRecords: true
                        }
                    }
                }
            },
            teacher: {
                include: {
                    _count: {
                        select: {
                            courseOfferings: true,
                            attendances: true
                        }
                    }
                }
            }
        }
    });
    if (!user) {
        return {
            success: false,
            hasDependencies: false,
            message: 'User not found'
        };
    }
    const dependencies = {};
    let hasDependencies = false;
    // Check student dependencies
    if (user.student) {
        dependencies.enrollments = user.student._count.enrollments;
        dependencies.attendanceRecords = user.student._count.attendanceRecords;
        if (dependencies.enrollments > 0 || dependencies.attendanceRecords > 0) {
            hasDependencies = true;
        }
    }
    // Check teacher dependencies
    if (user.teacher) {
        dependencies.courseOfferings = user.teacher._count.courseOfferings;
        dependencies.attendances = user.teacher._count.attendances;
        if (dependencies.courseOfferings > 0 || dependencies.attendances > 0) {
            hasDependencies = true;
        }
    }
    if (hasDependencies) {
        const depList = Object.entries(dependencies)
            .filter(([, count]) => count > 0)
            .map(([type, count]) => `${count} ${type}`)
            .join(', ');
        return {
            success: false,
            hasDependencies: true,
            dependencies,
            message: `Cannot delete user. User has ${depList}. Please remove these dependencies first.`
        };
    }
    return {
        success: true,
        hasDependencies: false,
        message: 'User can be safely deleted'
    };
}
/**
 * Force deletes a user and all related records
 * @param prisma - Prisma client instance
 * @param userId - User ID
 */
async function forceDeleteUser(prisma, userId) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            student: {
                include: {
                    attendanceRecords: true,
                    enrollments: true
                }
            },
            teacher: {
                include: {
                    attendances: true,
                    courseOfferings: true
                }
            },
            admin: true,
            reportViewer: true,
            userRoles: true
        }
    });
    if (!user) {
        throw new Error('User not found');
    }
    // Delete student-related records
    if (user.student) {
        await prisma.attendanceRecord.deleteMany({
            where: { studentId: user.student.id }
        });
        await prisma.studentEnrollment.deleteMany({
            where: { studentId: user.student.id }
        });
        await prisma.student.delete({
            where: { id: user.student.id }
        });
    }
    // Delete teacher-related records
    if (user.teacher) {
        await prisma.attendance.deleteMany({
            where: { teacherId: user.teacher.id }
        });
        await prisma.courseOffering.deleteMany({
            where: { teacherId: user.teacher.id }
        });
        await prisma.teacher.delete({
            where: { id: user.teacher.id }
        });
    }
    // Delete other related records
    if (user.admin) {
        await prisma.admin.delete({
            where: { userId: userId }
        });
    }
    if (user.reportViewer) {
        await prisma.reportViewer.delete({
            where: { userId: userId }
        });
    }
    await prisma.userRoleAssignment.deleteMany({
        where: { userId: userId }
    });
    // Finally delete the user
    await prisma.user.delete({
        where: { id: userId }
    });
}
