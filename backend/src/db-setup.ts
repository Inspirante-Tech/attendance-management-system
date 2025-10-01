import DatabaseService from './services/database.service';

async function validateSchema() {
  const db = DatabaseService.getInstance();
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
  } catch (error) {
    console.error('Schema validation failed:', error);
    return false;
  }
}

async function main() {
  console.log('🌱 Starting database setup...');

  try {
    // Initialize database service
    const db = DatabaseService.getInstance();
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
    const { seed } = await import('./database/seed');
    await seed();

    console.log('🌱 Database setup completed successfully');
  } catch (error) {
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
    await DatabaseService.getInstance().disconnect();
  });
