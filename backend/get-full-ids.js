const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

async function getFullIds() {
  try {
    const cs301 = await prisma.course.findFirst({
      where: { code: 'CS301' }
    });

    const offerings = await prisma.courseOffering.findMany({
      where: {
        courseId: cs301.id,
        semester: 5
      },
      include: {
        sections: true
      },
      orderBy: {
        sections: { section_name: 'asc' }
      }
    });

    console.log('\nCS301 Offerings (Full IDs):\n');
    offerings.forEach((o, idx) => {
      console.log(`${idx + 1}. Section ${o.sections?.section_name}`);
      console.log(`   Offering ID: ${o.id}`);
      console.log(`   Section ID: ${o.section_id}`);
      console.log(`   Teacher: ${o.teacher_id || 'None'}\n`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

getFullIds();
