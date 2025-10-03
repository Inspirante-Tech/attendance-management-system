const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

async function verify() {
  try {
    console.log('\nÌ¥ç CHECKING ALL COURSE OFFERINGS FOR DUPLICATES\n');
    console.log('='.repeat(80) + '\n');

    const offerings = await prisma.courseOffering.findMany({
      where: { semester: 5 },
      include: {
        course: true,
        sections: true,
        _count: { select: { enrollments: true } }
      }
    });

    console.log(`Total Semester 5 Offerings: ${offerings.length}\n`);

    // Group by course
    const grouped = {};
    offerings.forEach(o => {
      const key = o.course.code;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(o);
    });

    // Check each course
    for (const [code, offers] of Object.entries(grouped).sort()) {
      console.log(`\nÌ≥ö ${code} - ${offers[0].course.name}`);
      console.log(`   Total: ${offers.length} offerings\n`);

      // Group by section
      const bySection = {};
      offers.forEach(o => {
        const sec = o.sections?.section_name || 'NULL';
        if (!bySection[sec]) bySection[sec] = [];
        bySection[sec].push(o);
      });

      // Show sections
      for (const [sec, secOffers] of Object.entries(bySection).sort()) {
        const icon = secOffers.length > 1 ? '‚ùå DUPLICATE' : '‚úÖ';
        console.log(`   ${icon} Section ${sec}: ${secOffers.length} offering(s)`);
        
        secOffers.forEach((o, i) => {
          console.log(`      ${i + 1}. ID: ${o.id}`);
          console.log(`         Students: ${o._count.enrollments}, Teacher: ${o.teacherId ? 'Yes' : 'No'}`);
        });
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('\nÌ≤° TO DELETE A DUPLICATE IN PRISMA STUDIO:');
    console.log('   1. Go to http://localhost:5556');
    console.log('   2. Click "CourseOffering" table');
    console.log('   3. Find the ID listed above');
    console.log('   4. Click the row and delete it\n');

  } catch (error) {
    console.error('‚ùå Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
