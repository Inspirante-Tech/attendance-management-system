"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/teacher/marksRoutes.ts
const express_1 = require("express");
const database_1 = __importDefault(require("../../lib/database"));
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
// Update student marks (teachers can only update marks for their assigned courses)
// Body: { marks: [{ testComponentId: string, marksObtained: number }] }
router.put('/marks/:enrollmentId', auth_1.authenticateToken, async (req, res) => {
    const { enrollmentId } = req.params;
    const { marks } = req.body;
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ status: 'error', message: 'User not authenticated' });
        }
        const prisma = database_1.default.getInstance();
        const teacher = await prisma.teacher.findUnique({ where: { userId } });
        if (!teacher) {
            return res.status(403).json({ status: 'error', message: 'Teacher not found' });
        }
        const enrollment = await prisma.studentEnrollment.findUnique({
            where: { id: enrollmentId },
            include: {
                offering: {
                    include: {
                        teacher: true,
                        testComponents: true
                    }
                }
            }
        });
        if (!enrollment) {
            return res.status(404).json({ status: 'error', error: 'Enrollment not found' });
        }
        if (!enrollment.offering || enrollment.offering.teacherId !== teacher.id) {
            return res.status(403).json({ status: 'error', error: 'Access denied - you can only update marks for your assigned courses' });
        }
        if (!marks || !Array.isArray(marks)) {
            return res.status(400).json({
                status: 'error',
                error: 'Invalid marks data. Expected array of { testComponentId, marksObtained }'
            });
        }
        // Validate all test components belong to this offering
        const validComponentIds = enrollment.offering.testComponents.map(tc => tc.id);
        const invalidComponents = marks.filter(m => !validComponentIds.includes(m.testComponentId));
        if (invalidComponents.length > 0) {
            return res.status(400).json({
                status: 'error',
                error: 'Invalid test component IDs',
                invalidComponents: invalidComponents.map(m => m.testComponentId)
            });
        }
        // Validate marks don't exceed max
        for (const mark of marks) {
            const testComponent = enrollment.offering.testComponents.find(tc => tc.id === mark.testComponentId);
            if (testComponent && mark.marksObtained > testComponent.maxMarks) {
                return res.status(400).json({
                    status: 'error',
                    error: `Marks obtained (${mark.marksObtained}) exceed max marks (${testComponent.maxMarks}) for ${testComponent.name}`
                });
            }
        }
        // Update or create marks
        const updatePromises = marks.map(async (mark) => {
            return prisma.studentMark.upsert({
                where: {
                    enrollmentId_testComponentId: {
                        enrollmentId,
                        testComponentId: mark.testComponentId
                    }
                },
                update: {
                    marksObtained: mark.marksObtained
                },
                create: {
                    enrollmentId,
                    testComponentId: mark.testComponentId,
                    marksObtained: mark.marksObtained
                }
            });
        });
        await Promise.all(updatePromises);
        res.json({ status: 'success', message: 'Marks updated successfully' });
    }
    catch (error) {
        console.error('Error updating marks:', error);
        res.status(500).json({ status: 'error', message: 'Failed to update marks', error: error instanceof Error ? error.message : 'Unknown error' });
    }
});
// Get marks for students in teacher's courses
router.get('/marks', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { courseId, studentUsn } = req.query;
        if (!userId) {
            return res.status(401).json({ status: 'error', message: 'User not authenticated' });
        }
        const prisma = database_1.default.getInstance();
        const teacher = await prisma.teacher.findUnique({
            where: { userId },
            include: {
                courseOfferings: {
                    include: { course: true }
                }
            }
        });
        if (!teacher) {
            return res.status(403).json({ status: 'error', message: 'Teacher not found' });
        }
        const whereClause = { offering: { teacherId: teacher.id } };
        if (courseId)
            whereClause.offering.courseId = courseId;
        if (studentUsn)
            whereClause.student = { usn: studentUsn };
        const enrollments = await prisma.studentEnrollment.findMany({
            where: whereClause,
            include: {
                student: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true }
                        }
                    }
                },
                offering: {
                    include: {
                        course: {
                            select: {
                                id: true,
                                code: true,
                                name: true,
                                hasTheoryComponent: true,
                                hasLabComponent: true
                            }
                        },
                        testComponents: true
                    }
                },
                studentMarks: {
                    include: {
                        testComponent: true
                    }
                }
            }
        });
        const transformedData = enrollments.map(enrollment => {
            // Group marks by test type
            const theoryMarks = [];
            const labMarks = [];
            let theoryTotal = 0;
            let labTotal = 0;
            enrollment.studentMarks.forEach(mark => {
                const markData = {
                    id: mark.id,
                    testComponentId: mark.testComponentId,
                    testName: mark.testComponent.name,
                    maxMarks: mark.testComponent.maxMarks,
                    marksObtained: mark.marksObtained,
                    weightage: mark.testComponent.weightage
                };
                if (mark.testComponent.type === 'theory') {
                    theoryMarks.push(markData);
                    theoryTotal += mark.marksObtained || 0;
                }
                else if (mark.testComponent.type === 'lab') {
                    labMarks.push(markData);
                    labTotal += mark.marksObtained || 0;
                }
            });
            return {
                id: enrollment.id,
                enrollmentId: enrollment.id,
                student: enrollment.student ? {
                    id: enrollment.student.id,
                    usn: enrollment.student.usn,
                    user: enrollment.student.user
                } : null,
                course: enrollment.offering?.course || null,
                testComponents: enrollment.offering?.testComponents || [],
                theoryMarks,
                labMarks,
                theoryTotal,
                labTotal,
                grandTotal: theoryTotal + labTotal
            };
        });
        res.json({ status: 'success', data: transformedData });
    }
    catch (error) {
        console.error('Error fetching teacher marks:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch marks', error: error instanceof Error ? error.message : 'Unknown error' });
    }
});
exports.default = router;
