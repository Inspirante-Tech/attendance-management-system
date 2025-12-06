"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seed = seed;
const bcryptjs_1 = require("bcryptjs");
const database_service_1 = __importDefault(require("../services/database.service"));
async function seed() {
    const db = database_service_1.default.getInstance();
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
        const adminPasswordHash = await (0, bcryptjs_1.hash)('admin123', 10);
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
    }
    catch (error) {
        console.error('Failed to seed database:', error);
        throw error;
    }
}
