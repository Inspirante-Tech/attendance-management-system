const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

async function checkDuplicates() {
  try {
    console.log('\nÌ¥ç Checking for Duplicate Section Offerings\n');
    console.log('='.repeat(80) + '\n');

    // Get all offerings grouped by course
    const courses = await prisma.course.findMany({
      where: { code: { in: ['CS301', 'CS202', 'CS203', 'CS204'] } },
      include: {
        department: {
          include: { college: true }
        }
      }
    });

    for (const course of courses) {
      console.log(`\nÌ≥ö ${course.code} - ${course.name}`);
      console.log(`   College: ${course.department.college.name}`);
      console.log(`   Department: ${course.department.name}\n`);

      const offerings = await prisma.courseOffering.findMany({
        where: {
          courseId: course.id,
          semester: 5
        },
        include: {
          sections: true,
          _count: { select: { enrollments: true } }
        }
      });

      console.log(`   Total offerings: ${offerings.length}`);

      // Group by section
      const bySectionName = {};
      offerings.forEach(o => {
        const sectionName = o.sections?.section_name || 'NULL';
        if (!bySectionName[sectionName]) {
          bySectionName[sectionName] = [];
        }
        bySectionName[sectionName].push(o);
      });

      // Show each section
      Object.entries(bySectionName).forEach(([sectionName, offers]) => {
        const status = offers.length > 1 ? '‚ùå DUPLICATE' : '‚úÖ';
        console.log(`\n   ${status} Section ${sectionName}: ${offers.length} offering(s)`);
        
        offers.forEach((o, idx) => {
          console.log(`      ${idx + 1}. Offering ID: ${o.id}`);
          console.log(`         Students: ${o._count.enrollments}`);
          console.log(`         Teacher: ${o.teacher_id || 'None'}`);
          console.log(`         Section ID: ${o.section_id}`);
        });
      });

      console.log('\n' + '-'.repeat(80));
    }

  } catch (error) {
    console.error('‚ùå Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDuplicates();
