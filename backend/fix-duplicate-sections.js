const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

async function fixDuplicateSections() {
  try {
    console.log('\nÌ¥ß FIXING DUPLICATE PHYSICAL SECTIONS\n');
    console.log('='.repeat(80) + '\n');

    // Get CS departments
    const csDepts = await prisma.department.findMany({
      where: { code: 'CS' },
      include: {
        colleges: true
      }
    });

    for (const dept of csDepts) {
      console.log(`\nÌ≥ç ${dept.colleges.name} - ${dept.name}\n`);

      // Get all sections for this department
      const sections = await prisma.sections.findMany({
        where: { department_id: dept.id },
        include: {
          course_offerings: true,
          students: true
        },
        orderBy: {
          section_name: 'asc'
        }
      });

      console.log(`Found ${sections.length} physical sections\n`);

      // Group by section name
      const grouped = {};
      sections.forEach(s => {
        if (!grouped[s.section_name]) grouped[s.section_name] = [];
        grouped[s.section_name].push(s);
      });

      // Process duplicates
      for (const [name, sectionList] of Object.entries(grouped).sort()) {
        if (sectionList.length === 1) {
          console.log(`‚úÖ Section ${name}: OK (1 entry)`);
          continue;
        }

        console.log(`\n‚ùå Section ${name}: ${sectionList.length} duplicates`);

        // Decide which to keep: one with offerings/students, or first one
        const sorted = [...sectionList].sort((a, b) => {
          const aScore = a.course_offerings.length * 100 + a.students.length;
          const bScore = b.course_offerings.length * 100 + b.students.length;
          return bScore - aScore;
        });

        const keep = sorted[0];
        const deleteList = sorted.slice(1);

        console.log(`   ‚úÖ KEEP: ${keep.section_id.substring(0, 10)}... (${keep.course_offerings.length} offerings, ${keep.students.length} students)`);

        for (const del of deleteList) {
          console.log(`   ‚ùå DELETE: ${del.section_id.substring(0, 10)}... (${del.course_offerings.length} offerings, ${del.students.length} students)`);

          // Move offerings
          if (del.course_offerings.length > 0) {
            console.log(`      Moving ${del.course_offerings.length} offerings...`);
            for (const offering of del.course_offerings) {
              await prisma.courseOffering.update({
                where: { id: offering.id },
                data: { section_id: keep.section_id }
              });
            }
          }

          // Move students
          if (del.students.length > 0) {
            console.log(`      Moving ${del.students.length} students...`);
            for (const student of del.students) {
              await prisma.student.update({
                where: { id: student.id },
                data: { section_id: keep.section_id }
              });
            }
          }

          // Delete empty section
          await prisma.sections.delete({
            where: { section_id: del.section_id }
          });
          console.log(`      ‚úì Deleted`);
        }
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n‚úÖ FIX COMPLETE!\n');

    // Verify
    console.log('Ì¥ç VERIFICATION:\n');
    for (const dept of csDepts) {
      const finalSections = await prisma.sections.findMany({
        where: { department_id: dept.id },
        orderBy: { section_name: 'asc' }
      });
      console.log(`${dept.colleges.name} CS: ${finalSections.map(s => s.section_name).join(', ')}`);
    }

    console.log('\n' + '='.repeat(80) + '\n');

  } catch (error) {
    console.error('\n‚ùå Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDuplicateSections();
