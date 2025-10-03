const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

async function checkBothColleges() {
  try {
    const colleges = await prisma.college.findMany({
      where: {
        name: { in: ['NMIT', 'NMAMIT'] }
      }
    });

    for (const college of colleges) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`í³ ${college.name}`);
      console.log('='.repeat(80) + '\n');

      // Get CS department
      const csDept = await prisma.department.findFirst({
        where: {
          name: { contains: 'Computer Science' },
          collegeId: college.id
        }
      });

      if (!csDept) {
        console.log('No CS department found');
        continue;
      }

      console.log(`Department: ${csDept.name}\n`);

      // Get CS301 course
      const cs301 = await prisma.course.findFirst({
        where: {
          code: 'CS301',
          departmentId: csDept.id
        }
      });

      if (!cs301) {
        console.log('No CS301 found');
        continue;
      }

      console.log(`Course: ${cs301.code} - ${cs301.name}\n`);

      // Get offerings
      const offerings = await prisma.courseOffering.findMany({
        where: {
          courseId: cs301.id,
          semester: 5
        },
        include: {
          sections: true,
          _count: { select: { enrollments: true } }
        },
        orderBy: {
          sections: { section_name: 'asc' }
        }
      });

      console.log(`Total offerings: ${offerings.length}\n`);

      offerings.forEach((o, idx) => {
        console.log(`${idx + 1}. Section ${o.sections?.section_name}`);
        console.log(`   Offering ID: ${o.id}`);
        console.log(`   Students: ${o._count.enrollments}`);
        console.log(`   Teacher: ${o.teacher_id || 'None'}\n`);
      });
    }

  } catch (error) {
    console.error('Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBothColleges();
