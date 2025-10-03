const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

async function checkCS301() {
  try {
    console.log('\nÌ≥ä Checking CS301 Course Offerings\n');
    console.log('='.repeat(80) + '\n');

    // Get NMAMIT CS department
    const nmamit = await prisma.college.findFirst({
      where: { code: 'NMAMIT' }
    });

    const csDept = await prisma.department.findFirst({
      where: { code: 'CS', college_id: nmamit.id }
    });

    // Get CS301 course
    const cs301 = await prisma.course.findFirst({
      where: {
        code: 'CS301',
        departmentId: csDept.id
      }
    });

    console.log(`CS301 Course ID: ${cs301.id}\n`);

    // Get all offerings
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

    console.log(`Found ${offerings.length} offerings:\n`);

    offerings.forEach((offering, idx) => {
      console.log(`${idx + 1}. Offering ID: ${offering.id.substring(0, 8)}...`);
      console.log(`   Section: ${offering.sections?.section_name || 'NULL'}`);
      console.log(`   Section ID: ${offering.section_id?.substring(0, 8) || 'NULL'}...`);
      console.log(`   Students: ${offering._count.enrollments}`);
      console.log(`   Teacher: ${offering.teacherId ? offering.teacherId.substring(0, 8) + '...' : 'None'}`);
      console.log('');
    });

    // Check for duplicates
    const sectionCounts = {};
    offerings.forEach(o => {
      const sName = o.sections?.section_name || 'NULL';
      sectionCounts[sName] = (sectionCounts[sName] || 0) + 1;
    });

    console.log('Section Summary:');
    Object.entries(sectionCounts).forEach(([section, count]) => {
      const status = count > 1 ? '‚ùå DUPLICATE' : '‚úÖ';
      console.log(`  ${status} Section ${section}: ${count} offering(s)`);
    });

    console.log('\n' + '='.repeat(80));

  } catch (error) {
    console.error('‚ùå Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkCS301();
