import { PrismaClient } from '../generated/prisma';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function createTeacher() {
    try {
        console.log('Creating new teacher...');

        // Get a college and department
        const college = await prisma.college.findFirst();
        if (!college) {
            console.log('❌ No college found. Please seed basic data first.');
            return;
        }

        const department = await prisma.department.findFirst({
            where: { college_id: college.id }
        });
        if (!department) {
            console.log('❌ No department found. Please seed basic data first.');
            return;
        }

        // Check if teacher1 already exists
        const existingUser = await prisma.user.findUnique({
            where: { username: 'teacher1' }
        });

        if (existingUser) {
            console.log('⚠️  Teacher with username "teacher1" already exists');
            return;
        }

        // Create teacher user
        const passwordHash = await hash('teacher123', 10);
        const teacher = await prisma.user.create({
            data: {
                username: 'teacher1',
                name: 'Demo Teacher',
                email: 'teacher1@example.com',
                passwordHash,
                userRoles: {
                    create: {
                        role: 'teacher'
                    }
                },
                teacher: {
                    create: {
                        college_id: college.id,
                        departmentId: department.id
                    }
                }
            }
        });

        console.log('✅ Teacher created successfully!');
        console.log('--------------------');
        console.log('Username: teacher1');
        console.log('Password: teacher123');
        console.log('Name: Demo Teacher');
        console.log('College: ' + college.name);
        console.log('Department: ' + department.name);
        console.log('--------------------');

    } catch (error) {
        console.error('❌ Error creating teacher:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createTeacher();
