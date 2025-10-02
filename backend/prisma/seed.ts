import { PrismaClient } from '../generated/prisma';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function seed() {
    try {
        console.log('Cleaning up existing data...');
        await prisma.$transaction([
            prisma.studentEnrollment.deleteMany(),
            prisma.courseOffering.deleteMany(),
            prisma.course.deleteMany(),
            prisma.teacher.deleteMany(),
            prisma.student.deleteMany(),
            prisma.user.deleteMany(),
            prisma.sections.deleteMany(),
            prisma.department.deleteMany(),
            prisma.academic_years.deleteMany(),
            prisma.college.deleteMany(),
        ]);

        console.log('Creating colleges...');
        const [nmamit, nmit] = await Promise.all([
            prisma.college.create({
                data: {
                    name: 'NMAM Institute of Technology',
                    code: 'NMAMIT'
                }
            }),
            prisma.college.create({
                data: {
                    name: 'Nitte Meenakshi Institute of Technology',
                    code: 'NMIT'
                }
            })
        ]);

        console.log('Creating academic years...');
        await Promise.all([
            prisma.academic_years.create({
                data: {
                    college_id: nmamit.id,
                    year_name: '2024-25',
                    start_date: new Date('2024-06-01'),
                    end_date: new Date('2025-05-31'),
                    is_active: true
                }
            }),
            prisma.academic_years.create({
                data: {
                    college_id: nmit.id,
                    year_name: '2024-25',
                    start_date: new Date('2024-06-01'),
                    end_date: new Date('2025-05-31'),
                    is_active: true
                }
            })
        ]);

        console.log('Creating departments...');
        const departments = [
            { name: 'Computer Science and Engineering', code: 'CS' },
            { name: 'Information Science and Engineering', code: 'IS' },
            { name: 'Mechanical Engineering', code: 'ME' },
            { name: 'Civil Engineering', code: 'CE' },
            { name: 'Electronics and Communication Engineering', code: 'EC' }
        ];

        const [nmamitDepts, nmitDepts] = await Promise.all([
            Promise.all(
                departments.map(dept =>
                    prisma.department.create({
                        data: {
                            name: dept.name,
                            code: dept.code,
                            college_id: nmamit.id
                        }
                    })
                )
            ),
            Promise.all(
                departments.map(dept =>
                    prisma.department.create({
                        data: {
                            name: dept.name,
                            code: dept.code,
                            college_id: nmit.id
                        }
                    })
                )
            )
        ]);

        console.log('Creating sections...');
        const sectionNames = ['A', 'B', 'C'];
        const allDepts = [...nmamitDepts, ...nmitDepts];
        const deptSections = [];

        for (const dept of allDepts) {
            const sections = await Promise.all(
                sectionNames.map(name =>
                    prisma.sections.create({
                        data: {
                            section_name: name,
                            department_id: dept.id
                        }
                    })
                )
            );
            deptSections.push({ dept, sections });
        }

        console.log('Creating teachers...');
        const teachersByCollege: { nmamit: any[]; nmit: any[] } = { nmamit: [], nmit: [] };

        for (const { dept, sections } of deptSections) {
            const isNMAMIT = nmamitDepts.includes(dept);
            const college = isNMAMIT ? nmamit : nmit;
            const prefix = college.code;

            for (let i = 1; i <= 3; i++) {
                const username = `${prefix.toLowerCase()}_${dept.code}_t${i}`;
                const passwordHash = await hash('teacher123', 10);

                const teacher = await prisma.user.create({
                    data: {
                        username,
                        name: `${dept.code} Teacher ${i}`,
                        email: `${username.toLowerCase()}@example.com`,
                        passwordHash,
                        userRoles: {
                            create: {
                                role: 'teacher'
                            }
                        },
                        teacher: {
                            create: {
                                college_id: college.id,
                                departmentId: dept.id
                            }
                        }
                    }
                });

                if (isNMAMIT) {
                    teachersByCollege.nmamit.push(teacher);
                } else {
                    teachersByCollege.nmit.push(teacher);
                }
            }
        }

        console.log('Creating students...');
        const studentsByCollege: { nmamit: any[]; nmit: any[] } = { nmamit: [], nmit: [] };

        for (const { dept, sections } of deptSections) {
            const isNMAMIT = nmamitDepts.includes(dept);
            const college = isNMAMIT ? nmamit : nmit;
            const prefix = isNMAMIT ? 'NNM' : 'NMI';

            for (const section of sections) {
                for (let i = 1; i <= 5; i++) {
                    const usn = `${prefix}23${dept.code}${section.section_name}${String(i).padStart(2, '0')}`;
                    const passwordHash = await hash('student123', 10);

                    const student = await prisma.user.create({
                        data: {
                            username: usn,
                            name: `Student ${usn}`,
                            email: `${usn.toLowerCase()}@example.com`,
                            passwordHash,
                            userRoles: {
                                create: {
                                    role: 'student'
                                }
                            },
                            student: {
                                create: {
                                    usn,
                                    semester: 3,
                                    batchYear: 2023,
                                    college_id: college.id,
                                    department_id: dept.id,
                                    section_id: section.section_id
                                }
                            }
                        }
                    });

                    if (isNMAMIT) {
                        studentsByCollege.nmamit.push(student);
                    } else {
                        studentsByCollege.nmit.push(student);
                    }
                }
            }
        }

        console.log('Creating admin user...');
        const adminPasswordHash = await hash('admin123', 10);
        const admin = await prisma.user.create({
            data: {
                username: 'admin',
                name: 'System Admin',
                email: 'admin@example.com',
                passwordHash: adminPasswordHash,
                userRoles: {
                    create: {
                        role: 'admin'
                    }
                },
                admin: {
                    create: {}
                }
            }
        });

        console.log('Seed completed successfully');
        console.log('--------------------');
        console.log('Summary:');
        console.log(`NMAMIT Teachers: ${teachersByCollege.nmamit.length}`);
        console.log(`NMIT Teachers: ${teachersByCollege.nmit.length}`);
        console.log(`NMAMIT Students: ${studentsByCollege.nmamit.length}`);
        console.log(`NMIT Students: ${studentsByCollege.nmit.length}`);
        console.log('--------------------');
    } catch (error) {
        console.error('Error during seeding:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

seed();
