import { PrismaClient } from './generated/prisma';

const prisma = new PrismaClient();

async function listUsers() {
    try {
        const teachers = await prisma.user.findMany({
            where: {
                userRoles: {
                    some: {
                        role: 'teacher'
                    }
                }
            }
        });

        console.log('Teachers in database:');
        teachers.forEach(teacher => {
            console.log(`Username: ${teacher.username}`);
        });

        console.log(`\nTotal teachers: ${teachers.length}`);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

listUsers();
