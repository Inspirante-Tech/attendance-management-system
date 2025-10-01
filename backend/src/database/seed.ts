import { hash } from 'bcryptjs';
import DatabaseService from '../services/database.service';

export async function seed() {
    const db = DatabaseService.getInstance();
    const prisma = db.getPrisma();

    try {
        // Create default college
        const college = await prisma.college.create({
            data: {
                name: 'NMAM Institute of Technology',
                code: 'NMAMIT',
            },
        });

        // Create default academic year
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
        return { college, academicYear, departments, adminUser };
    } catch (error) {
        console.error('Failed to seed database:', error);
        throw error;
    }
}