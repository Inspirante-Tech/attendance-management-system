const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

async function testAnalytics() {
  try {
    console.log('\ní´ TESTING ANALYTICS QUERY STRUCTURE\n');
    console.log('='.repeat(80) + '\n');

    // Get CS department with sections
    const dept = await prisma.department.findFirst({
      where: {
        code: 'CS'
      },
      include: {
        sections: {
          include: {
            course_offerings: {
              where: {
                semester: 5,
                course: { code: 'CS301' }
              },
              include: {
                course: true,
                sections: true
              }
            }
          }
        }
      }
    });

    console.log(`Department: ${dept.name}`);
    console.log(`Sections in department: ${dept.sections.length}\n`);

    dept.sections.forEach(section => {
      console.log(`Section ${section.section_name}:`);
      console.log(`  Course offerings: ${section.course_offerings.length}`);
      section.course_offerings.forEach(offering => {
        console.log(`    - ${offering.course.code} (Offering section: ${offering.sections?.section_name})`);
      });
    });

    console.log('\n' + '='.repeat(80));
    console.log('\ní³Š FLATTENED VIEW:\n');

    const allOfferings = dept.sections.flatMap(section => section.course_offerings);
    console.log(`Total offerings after flatMap: ${allOfferings.length}\n`);

    const courseMap = new Map();
    for (const offering of allOfferings) {
      const courseKey = offering.course.code;
      if (!courseMap.has(courseKey)) {
        courseMap.set(courseKey, {
          code: offering.course.code,
          sections: []
        });
      }
      courseMap.get(courseKey).sections.push({
        section: offering.sections?.section_name || 'NULL'
      });
    }

    console.log('Courses in map:');
    for (const [code, data] of courseMap.entries()) {
      console.log(`  ${code}: ${data.sections.length} sections`);
      data.sections.forEach(s => {
        console.log(`    - Section ${s.section}`);
      });
    }

    console.log('\n' + '='.repeat(80) + '\n');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testAnalytics();
