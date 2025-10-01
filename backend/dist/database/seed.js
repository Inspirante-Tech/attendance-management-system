"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seed = seed;
const bcryptjs_1 = require("bcryptjs");
const database_service_1 = __importDefault(require("../services/database.service"));
function seed() {
    return __awaiter(this, void 0, void 0, function* () {
        const db = database_service_1.default.getInstance();
        const prisma = db.getPrisma();
        try {
            // Create default college
            const college = yield prisma.college.create({
                data: {
                    name: 'NMAM Institute of Technology',
                    code: 'NMAMIT',
                },
            });
            // Create default academic year
            const academicYear = yield prisma.academic_years.create({
                data: {
                    college_id: college.id,
                    year_name: '2024-25',
                    start_date: new Date('2024-06-01'),
                    end_date: new Date('2025-05-31'),
                    is_active: true,
                },
            });
            // Create default departments
            const departments = yield Promise.all([
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
            const adminPasswordHash = yield (0, bcryptjs_1.hash)('admin123', 10);
            const adminUser = yield prisma.user.create({
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
    });
}
