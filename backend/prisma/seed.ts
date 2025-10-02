import { hash } from 'bcryptjs';
import { Prisma } from '@prisma/client';
import DatabaseService from '../src/services/database.service';

async function seed() {
    const db = DatabaseService.getInstance();
    const prisma = db.getPrisma();

    try {
        // Clean up existing data
        console.log('🧹 Cleaning up existing data...');
        await prisma.user.deleteMany();
        await prisma.college.deleteMany();

        // Create default college
        console.log('🏫 Creating college...');
        const college = await prisma.college.create({
            data: {
                name: 'NMAM Institute of Technology',
                code: 'NMAMIT',
            },
        });

        // Create default academic year
        console.log('📅 Creating academic year...');
        const academicYear = await prisma.academic_years.create({
            data: {
                college_id: college.id,
                year_name: '2024-25',
                start_date: new Date('2024-06-01'),
                end_date: new Date('2025-05-31'),
                is_active: true,
            },
        });

        // Create default departments
        console.log('🏢 Creating departments...');
        const departments = await Promise.all([
            prisma.department.create({
                data: {
                    college_id: college.id,
                    name: 'Computer Science and Engineering',
                    code: 'CSE',
                },
            }),
            prisma.department.create({
                data: {
                    college_id: college.id,
                    name: 'Information Science and Engineering',
                    code: 'ISE',
                },
            }),
            prisma.department.create({
                data: {
                    college_id: college.id,
                    name: 'Mechanical Engineering',
                    code: 'ME',
                },
            }),
            prisma.department.create({
                data: {
                    college_id: college.id,
                    name: 'Civil Engineering',
                    code: 'CE',
                },
            }),
            prisma.department.create({
                data: {
                    college_id: college.id,
                    name: 'Electronics and Communication Engineering',
                    code: 'ECE',
                },
            })
        ]);

        // Create courses for each department
        const courses = await Promise.all([
            // CSE Department Courses
            prisma.course.create({
                data: {
                    departmentId: departments[0].id,
                    code: 'CS3P01',
                    name: 'Data Structures and Algorithms',
                    type: "core",
                    hasTheoryComponent: true,
                    hasLabComponent: true,
                }
            }),
            prisma.course.create({
                data: {
                    departmentId: departments[0].id,
                    code: 'CS3P02',
                    name: 'Database Management Systems',
                    type: "core",
                    hasTheoryComponent: true,
                    hasLabComponent: true,
                }
            }),
            prisma.course.create({
                data: {
                    departmentId: departments[0].id,
                    code: 'CS3P03',
                    name: 'Machine Learning',
                    type: "department_elective",
                    hasTheoryComponent: true,
                    hasLabComponent: true,
                }
            }),
            prisma.course.create({
                data: {
                    departmentId: departments[0].id,
                    code: 'CS3O01',
                    name: 'Python Programming',
                    type: "open_elective",
                    hasTheoryComponent: true,
                    hasLabComponent: true,
                }
            }),

            // ISE Department Courses
            prisma.course.create({
                data: {
                    departmentId: departments[1].id,
                    code: 'IS3P01',
                    name: 'Software Engineering',
                    type: "core",
                    hasTheoryComponent: true,
                    hasLabComponent: false,
                }
            }),
            prisma.course.create({
                data: {
                    departmentId: departments[1].id,
                    code: 'IS3P02',
                    name: 'Web Technologies',
                    type: "core",
                    hasTheoryComponent: true,
                    hasLabComponent: true,
                }
            }),
            prisma.course.create({
                data: {
                    departmentId: departments[1].id,
                    code: 'IS3O01',
                    name: 'Cloud Computing',
                    type: "open_elective",
                    hasTheoryComponent: true,
                    hasLabComponent: false,
                }
            }),

            // ME Department Courses
            prisma.course.create({
                data: {
                    departmentId: departments[2].id,
                    code: 'ME3P01',
                    name: 'Engineering Mechanics',
                    type: "core",
                    hasTheoryComponent: true,
                    hasLabComponent: true,
                }
            }),
            prisma.course.create({
                data: {
                    departmentId: departments[2].id,
                    code: 'ME3O01',
                    name: 'Automobile Engineering',
                    type: "open_elective",
                    hasTheoryComponent: true,
                    hasLabComponent: false,
                }
            }),

            // CE Department Courses
            prisma.course.create({
                data: {
                    departmentId: departments[3].id,
                    code: 'CE3P01',
                    name: 'Structural Engineering',
                    type: "core",
                    hasTheoryComponent: true,
                    hasLabComponent: true,
                }
            }),
            prisma.course.create({
                data: {
                    departmentId: departments[3].id,
                    code: 'CE3O01',
                    name: 'Environmental Engineering',
                    type: "open_elective",
                    hasTheoryComponent: true,
                    hasLabComponent: false,
                }
            }),

            // ECE Department Courses
            prisma.course.create({
                data: {
                    departmentId: departments[4].id,
                    code: 'EC3P01',
                    name: 'Digital Electronics',
                    type: "core",
                    hasTheoryComponent: true,
                    hasLabComponent: true,
                }
            }),
            prisma.course.create({
                data: {
                    departmentId: departments[4].id,
                    code: 'EC3O01',
                    name: 'Internet of Things',
                    type: "open_elective",
                    hasTheoryComponent: true,
                    hasLabComponent: true,
                }
            })
        ]);

        // Create admin user
        const adminPasswordHash = await hash('admin123', 10);
        const adminUser = await prisma.user.create({
            data: {
                username: 'admin',
                passwordHash: adminPasswordHash,
                name: 'System Admin',
                email: 'admin@example.com',
                userRoles: {
                    create: {
                        role: 'admin',
                    },
                },
                admin: {
                    create: {},
                },
            },
        });

        console.log('✅ Seed data created successfully');
        console.log('College:', college.name);
        console.log('Academic Year:', academicYear.year_name);
        console.log('Departments:', departments.map(d => d.name).join(', '));
        console.log('Courses created:', courses.length);
        console.log('Sample courses:', courses.slice(0, 3).map(c => `${c.code} - ${c.name}`).join(', '));
        console.log('Admin User:', adminUser.username);

        return { college, academicYear, departments, courses, adminUser };
    } catch (error) {
        console.error('Failed to seed database:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

seed();