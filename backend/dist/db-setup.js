"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_service_1 = __importDefault(require("./services/database.service"));
async function validateSchema() {
    const db = database_service_1.default.getInstance();
    const prisma = db.getPrisma();
    try {
        // Test basic CRUD operations
        const testCollege = await prisma.college.create({
            data: {
                name: 'Test College',
                code: 'TEST',
            },
        });
        await prisma.college.delete({
            where: { id: testCollege.id },
        });
        return true;
    }
    catch (error) {
        console.error('Schema validation failed:', error);
        return false;
    }
}
async function main() {
    console.log('🌱 Starting database setup...');
    try {
        // Initialize database service
        const db = database_service_1.default.getInstance();
        await db.connect();
        // Validate database connection
        const isHealthy = await db.healthCheck();
        if (!isHealthy) {
            throw new Error('Database health check failed');
        }
        console.log('✅ Database health check passed');
        // Validate schema
        const isSchemaValid = await validateSchema();
        if (!isSchemaValid) {
            throw new Error('Schema validation failed');
        }
        console.log('✅ Schema validation passed');
        // Run the seed script
        const { seed } = await Promise.resolve().then(() => __importStar(require('./database/seed')));
        await seed();
        console.log('🌱 Database setup completed successfully');
    }
    catch (error) {
        console.error('❌ Database setup failed:', error);
        throw error;
    }
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await database_service_1.default.getInstance().disconnect();
});
