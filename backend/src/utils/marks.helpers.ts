/**
 * Helper functions for marks-related operations
 * Handles marks validation, transformation, and business logic
 */

import { PrismaClient } from '@prisma/client';
import { UpdateMarksRequest, StudentMarksData, TheoryMarks, LabMarks } from '../types/marks.types';

/**
 * Check if MSE3 is eligible based on MSE1 and MSE2 scores
 * MSE3 is only allowed if MSE1 + MSE2 < 20
 * @param mse1 - MSE1 marks
 * @param mse2 - MSE2 marks
 * @returns True if MSE3 is eligible, false otherwise
 */
export function isMSE3Eligible(mse1: number | null, mse2: number | null): boolean {
    const score1 = mse1 || 0;
    const score2 = mse2 || 0;
    return (score1 + score2) < 20;
}

/**
 * Determine if the update request contains theory marks
 * @param markData - Marks update request body
 * @returns True if contains theory marks fields
 */
export function hasTheoryMarksUpdate(markData: UpdateMarksRequest): boolean {
    const theoryFields = ['mse1_marks', 'mse2_marks', 'mse3_marks', 'task1_marks', 'task2_marks', 'task3_marks'];
    return theoryFields.some(field => field in markData);
}

/**
 * Determine if the update request contains lab marks
 * @param markData - Marks update request body
 * @returns True if contains lab marks fields
 */
export function hasLabMarksUpdate(markData: UpdateMarksRequest): boolean {
    const labFields = ['record_marks', 'continuous_evaluation_marks', 'lab_mse_marks'];
    return labFields.some(field => field in markData);
}

/**
 * Build theory marks data object from update request
 * Applies MSE3 eligibility rules
 * @param markData - Marks update request body
 * @param currentMarks - Current theory marks (if any)
 * @returns Theory marks data for database update
 */
export function buildTheoryMarksData(
    markData: UpdateMarksRequest,
    currentMarks: any | null
): any {
    const theoryMarkData: any = {
        lastUpdatedAt: new Date()
    };

    // Map request fields to database fields
    if ('mse1_marks' in markData) theoryMarkData.mse1Marks = markData.mse1_marks;
    if ('mse2_marks' in markData) theoryMarkData.mse2Marks = markData.mse2_marks;
    if ('mse3_marks' in markData) theoryMarkData.mse3Marks = markData.mse3_marks;
    if ('task1_marks' in markData) theoryMarkData.task1Marks = markData.task1_marks;
    if ('task2_marks' in markData) theoryMarkData.task2Marks = markData.task2_marks;
    if ('task3_marks' in markData) theoryMarkData.task3Marks = markData.task3_marks;

    // Calculate MSE1 + MSE2 total (use new values if being updated, otherwise use current values)
    const mse1 = theoryMarkData.mse1Marks !== undefined
        ? theoryMarkData.mse1Marks
        : (currentMarks?.mse1Marks || 0);
    const mse2 = theoryMarkData.mse2Marks !== undefined
        ? theoryMarkData.mse2Marks
        : (currentMarks?.mse2Marks || 0);

    // Apply MSE3 eligibility rule: MSE3 can only exist if MSE1 + MSE2 < 20
    if (!isMSE3Eligible(mse1, mse2)) {
        theoryMarkData.mse3Marks = null;
    }

    return theoryMarkData;
}

/**
 * Build lab marks data object from update request
 * @param markData - Marks update request body
 * @returns Lab marks data for database update
 */
export function buildLabMarksData(markData: UpdateMarksRequest): any {
    const labMarkData: any = {
        lastUpdatedAt: new Date()
    };

    // Map request fields to database fields
    if ('record_marks' in markData) {
        labMarkData.recordMarks = markData.record_marks;
    }
    if ('continuous_evaluation_marks' in markData) {
        labMarkData.continuousEvaluationMarks = markData.continuous_evaluation_marks;
    }
    if ('lab_mse_marks' in markData) {
        labMarkData.labMseMarks = markData.lab_mse_marks;
    }

    return labMarkData;
}

/**
 * Transform enrollment data into standardized marks data format
 * @param enrollment - Prisma enrollment object with marks
 * @returns Formatted student marks data
 */
export function transformToMarksData(enrollment: any): StudentMarksData {
    return {
        id: enrollment.id,
        enrollmentId: enrollment.id,
        student: enrollment.student ? {
            id: enrollment.student.id,
            usn: enrollment.student.usn,
            user: {
                name: enrollment.student.user.name
            }
        } : null,
        course: enrollment.offering?.course ? {
            id: enrollment.offering.course.id,
            code: enrollment.offering.course.code,
            name: enrollment.offering.course.name
        } : null,
        theoryMarks: enrollment.theoryMarks ? formatTheoryMarks(enrollment.theoryMarks) : null,
        labMarks: enrollment.labMarks ? formatLabMarks(enrollment.labMarks) : null,
        updatedAt: enrollment.theoryMarks?.lastUpdatedAt || enrollment.labMarks?.lastUpdatedAt || new Date()
    };
}

/**
 * Format theory marks from database to API response
 * @param marks - Database theory marks object
 * @returns Formatted theory marks
 */
function formatTheoryMarks(marks: any): TheoryMarks {
    return {
        id: marks.id,
        mse1_marks: marks.mse1Marks,
        mse2_marks: marks.mse2Marks,
        mse3_marks: marks.mse3Marks,
        task1_marks: marks.task1Marks,
        task2_marks: marks.task2Marks,
        task3_marks: marks.task3Marks,
        last_updated_at: marks.lastUpdatedAt
    };
}

/**
 * Format lab marks from database to API response
 * @param marks - Database lab marks object
 * @returns Formatted lab marks
 */
function formatLabMarks(marks: any): LabMarks {
    return {
        id: marks.id,
        record_marks: marks.recordMarks,
        continuous_evaluation_marks: marks.continuousEvaluationMarks,
        lab_mse_marks: marks.labMseMarks,
        last_updated_at: marks.lastUpdatedAt
    };
}

/**
 * Build where clause for marks query based on filters
 * @param params - Query parameters (courseId, departmentId, year, studentId, studentUsn)
 * @returns Prisma where clause
 */
export function buildMarksWhereClause(params: {
    courseId?: string;
    departmentId?: string;
    year?: string;
    studentId?: string;
    studentUsn?: string;
}): any {
    const whereClause: any = {};

    // Handle student filtering by either UUID or USN
    if (params.studentId || params.studentUsn) {
        whereClause.student = {};
        if (params.studentUsn) {
            whereClause.student.usn = params.studentUsn;
        } else if (params.studentId) {
            whereClause.studentId = params.studentId;
        }
    }

    // Filter by course
    if (params.courseId) {
        whereClause.offering = {
            courseId: params.courseId
        };
    }

    // Filter by department or batch year
    if (params.departmentId || params.year) {
        if (!whereClause.student) {
            whereClause.student = {};
        }
        if (params.departmentId) {
            whereClause.student.department_id = params.departmentId;
        }
        if (params.year) {
            whereClause.student.batchYear = parseInt(params.year);
        }
    }

    return whereClause;
}
