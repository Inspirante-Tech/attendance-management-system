/**
 * Type definitions for marks-related operations
 */

/**
 * Theory marks structure
 */
export interface TheoryMarks {
    id: string;
    mse1_marks: number | null;
    mse2_marks: number | null;
    mse3_marks: number | null;
    task1_marks: number | null;
    task2_marks: number | null;
    task3_marks: number | null;
    last_updated_at: Date;
}

/**
 * Lab marks structure
 */
export interface LabMarks {
    id: string;
    record_marks: number | null;
    continuous_evaluation_marks: number | null;
    lab_mse_marks: number | null;
    last_updated_at: Date;
}

/**
 * Combined marks data for a student enrollment
 */
export interface StudentMarksData {
    id: string;
    enrollmentId: string;
    student: {
        id: string;
        usn: string;
        user: {
            name: string;
        };
    } | null;
    course: {
        id: string;
        code: string;
        name: string;
    } | null;
    theoryMarks: TheoryMarks | null;
    labMarks: LabMarks | null;
    updatedAt: Date;
}

/**
 * Request body for updating marks
 */
export interface UpdateMarksRequest {
    // Theory marks
    mse1_marks?: number | null;
    mse2_marks?: number | null;
    mse3_marks?: number | null;
    task1_marks?: number | null;
    task2_marks?: number | null;
    task3_marks?: number | null;
    // Lab marks
    record_marks?: number | null;
    continuous_evaluation_marks?: number | null;
    lab_mse_marks?: number | null;
}

/**
 * Query parameters for fetching marks
 */
export interface GetMarksParams {
    courseId?: string;
    departmentId?: string;
    year?: string;
    studentId?: string;
    studentUsn?: string;
}
