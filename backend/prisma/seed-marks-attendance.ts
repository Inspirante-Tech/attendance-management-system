import { PrismaClient, test_type } from '../generated/prisma';

const prisma = new PrismaClient();

async function seedMarksAndAttendance() {
    try {
        console.log('Seeding marks and attendance data...');

        // Find the student NNM23CSA01
        const student = await prisma.student.findUnique({
            where: { usn: 'NNM23CSA01' },
            include: {
                user: true,
                enrollments: {
                    include: {
                        offering: {
                            include: {
                                course: true,
                                academic_years: true,
                                teacher: true,
                                sections: true
                            }
                        }
                    }
                }
            }
        });

        if (!student) {
            console.log('❌ Student NNM23CSA01 not found!');
            return;
        }

        console.log(`✓ Found student: ${student.user.name} (${student.usn})`);

        // Get or create course offerings for this student
        const courses = await prisma.course.findMany({
            where: {
                department: {
                    id: student.department_id!
                }
            },
            include: {
                department: true
            }
        });

        console.log(`Found ${courses.length} courses for department`);

        // Get academic year
        const academicYear = await prisma.academic_years.findFirst({
            where: {
                college_id: student.college_id,
                is_active: true
            }
        });

        if (!academicYear) {
            console.log('❌ No active academic year found!');
            return;
        }

        // Get a teacher from the same department
        const teacher = await prisma.teacher.findFirst({
            where: {
                departmentId: student.department_id
            },
            include: { user: true }
        });

        if (!teacher) {
            console.log('❌ No teacher found for the department!');
            return;
        }

        console.log(`✓ Using teacher: ${teacher.user.name}`);

        // Get the section
        const section = await prisma.sections.findUnique({
            where: {
                section_id: student.section_id!
            }
        });

        if (!section) {
            console.log('❌ Section not found!');
            return;
        }

        // Create course offerings and enroll student for first 4 courses
        const enrollments = [];
        for (let i = 0; i < Math.min(4, courses.length); i++) {
            const course = courses[i];

            // Check if offering exists
            let offering = await prisma.courseOffering.findFirst({
                where: {
                    courseId: course.id,
                    year_id: academicYear.year_id,
                    semester: 5,
                    section_id: student.section_id
                }
            });

            if (!offering) {
                offering = await prisma.courseOffering.create({
                    data: {
                        courseId: course.id,
                        teacherId: teacher.id,
                        section_id: student.section_id,
                        year_id: academicYear.year_id,
                        semester: 5
                    }
                });
                console.log(`✓ Created course offering for ${course.code}`);
            }

            // Check if student is already enrolled
            const existingEnrollment = await prisma.studentEnrollment.findFirst({
                where: {
                    studentId: student.id,
                    offeringId: offering.id
                }
            });

            let enrollment;
            if (!existingEnrollment) {
                enrollment = await prisma.studentEnrollment.create({
                    data: {
                        studentId: student.id,
                        offeringId: offering.id,
                        year_id: academicYear.year_id,
                        attemptNumber: 1
                    }
                });
                console.log(`✓ Enrolled student in ${course.code}`);
            } else {
                enrollment = existingEnrollment;
            }

            enrollments.push({ enrollment, offering, course });
        }

        console.log('\nCreating test components and marks...');

        // Create test components for each course and add marks
        for (let i = 0; i < enrollments.length; i++) {
            const { enrollment, offering, course } = enrollments[i];
            // Delete existing test components to recreate with marks
            await prisma.testComponent.deleteMany({
                where: { courseOfferingId: offering.id }
            });

            // Theory components
            const theoryTests = [
                { name: 'MSE1', maxMarks: 20, weightage: 25 },
                { name: 'MSE2', maxMarks: 20, weightage: 25 },
                { name: 'MSE3', maxMarks: 20, weightage: 25 },
                { name: 'Assignment', maxMarks: 10, weightage: 10 },
                { name: 'Participation', maxMarks: 10, weightage: 15 }
            ];

            for (const test of theoryTests) {
                const testComponent = await prisma.testComponent.create({
                    data: {
                        courseOfferingId: offering.id,
                        name: test.name,
                        maxMarks: test.maxMarks,
                        weightage: test.weightage,
                        type: 'theory'
                    }
                });

                // Add marks for this test
                const marksObtained = Math.floor(Math.random() * test.maxMarks);
                await prisma.studentMark.create({
                    data: {
                        enrollmentId: enrollment.id,
                        testComponentId: testComponent.id,
                        marksObtained
                    }
                });

                console.log(`  ✓ ${course.code} - ${test.name}: ${marksObtained}/${test.maxMarks}`);
            }

            // Lab components (only for some courses)
            if (i % 2 === 0) {
                const labTests = [
                    { name: 'Lab1', maxMarks: 25, weightage: 50 },
                    { name: 'Lab2', maxMarks: 25, weightage: 50 }
                ];

                for (const test of labTests) {
                    const testComponent = await prisma.testComponent.create({
                        data: {
                            courseOfferingId: offering.id,
                            name: test.name,
                            maxMarks: test.maxMarks,
                            weightage: test.weightage,
                            type: 'lab'
                        }
                    });

                    const marksObtained = Math.floor(Math.random() * test.maxMarks);
                    await prisma.studentMark.create({
                        data: {
                            enrollmentId: enrollment.id,
                            testComponentId: testComponent.id,
                            marksObtained
                        }
                    });

                    console.log(`  ✓ ${course.code} - ${test.name}: ${marksObtained}/${test.maxMarks}`);
                }
            }
        }

        console.log('\nCreating attendance data...');

        // Create attendance records for each course
        const startDate = new Date(academicYear.start_date || '2025-06-01');
        const attendanceRecords = [];

        for (const { offering, course } of enrollments) {
            // Create 20 attendance records spanning 4 weeks
            for (let day = 0; day < 20; day++) {
                const classDate = new Date(startDate);
                classDate.setDate(classDate.getDate() + day);

                // Skip weekends
                if (classDate.getDay() === 0 || classDate.getDay() === 6) {
                    continue;
                }

                const attendance = await prisma.attendance.create({
                    data: {
                        offeringId: offering.id,
                        teacherId: offering.teacherId,
                        classDate,
                        periodNumber: (day % 4) + 1,
                        syllabusCovered: `Topic ${day + 1} - ${course.name}`,
                        status: 'held'
                    }
                });

                // 80% chance of student being present
                const isPresent = Math.random() < 0.8;
                const status = isPresent ? 'present' : 'absent';

                await prisma.attendanceRecord.create({
                    data: {
                        attendanceId: attendance.id,
                        studentId: student.id,
                        status
                    }
                });

                attendanceRecords.push({ course: course.code, status, date: classDate });
            }

            const totalRecords = attendanceRecords.filter(r => r.course === course.code).length;
            const presentCount = attendanceRecords.filter(r => r.course === course.code && r.status === 'present').length;
            const percentage = ((presentCount / totalRecords) * 100).toFixed(1);

            console.log(`✓ ${course.code}: ${presentCount}/${totalRecords} classes (${percentage}%)`);
        }

        console.log('\n✅ Marks and attendance seeding completed successfully!');
        console.log('--------------------');
        console.log(`Student: ${student.user.name} (${student.usn})`);
        console.log(`Courses with marks and attendance: ${enrollments.length}`);
        console.log('--------------------');

    } catch (error) {
        console.error('❌ Error during seeding:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

seedMarksAndAttendance();
