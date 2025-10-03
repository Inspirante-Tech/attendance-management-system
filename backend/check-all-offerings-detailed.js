const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

async function checkAll() {
  try {
    console.log('\n�� DETAILED COURSE OFFERINGS CHECK\n');
    console.log('='.repeat(80) + '\n');

    // Get all semester 5 offerings
    const offerings = await prisma.courseOffering.findMany({
      where: { semester: 5 },
      include: {
        courses: true,
        sections: true,
        _count: { select: { enrollments: true } }
      },
      orderBy: [
        { courses: { code: 'asc' } },
        { sections: { section_name: 'asc' } }
      ]
    });

    console.log(`Total Semester 5 Offerings: ${offerings.length}\n`);

    // Group by course code
    const byCourse = {};
    offerings.forEach(o => {
      const code = o.courses.code;
      if (!byCourse[code]) byCourse[code] = [];
      byCourse[code].push(o);
    });

    // Analyze each course
    for (const [courseCode, courseOfferings] of Object.entries(byCourse)) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`��� ${courseCode} - ${courseOfferings[0].courses.name}`);
      console.log('='.repeat(80));
      console.log(`Total offerings: ${courseOfferings.length}\n`);

      // Group by section
      const bySection = {};
      courseOfferings.forEach(o => {
        const section = o.sections?.section_name || 'NULL';
        if (!bySection[section]) bySection[section] = [];
        bySection[section].push(o);
      });

      // Show details
      Object.entries(bySection).forEach(([section, offers]) => {
        const status = offers.length > 1 ? '❌ DUPLICATE' : '✅';
        console.log(`${status} Section ${section}: ${offers.length} offering(s)`);
        
        offers.forEach((o, idx) => {
          console.log(`\n   Offering #${idx + 1}:`);
          console.log(`   ┌─ ID: ${o.id}`);
          console.log(`   ├─ Section ID: ${o.section_id}`);
          console.log(`   ├─ Students: ${o._count.enrollments}`);
          console.log(`   ├─ Teacher: ${o.teacher_id || 'None'}`);
          console.log(`   └─ Academic Year: ${o.academic_year_id}`);
        });
        console.log('');
      });
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ Check Complete\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAll();
