const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

async function checkAll() {
  const csDepts = await prisma.department.findMany({
    where: { code: 'CS' },
    include: {
      colleges: true,
      sections: {
        include: {
          course_offerings: {
            where: {
              course: { code: 'CS301' },
              semester: 5
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

  console.log('\ní³Š CS301 OFFERINGS BY COLLEGE:\n');
  for (const dept of csDepts) {
    console.log(`${dept.colleges.name}:`);
    console.log(`  Department: ${dept.name}`);
    console.log(`  Sections: ${dept.sections.length}`);
    
    dept.sections.forEach(sec => {
      console.log(`\n  Section ${sec.section_name} (${sec.section_id.substring(0, 10)}...):`);
      console.log(`    CS301 offerings: ${sec.course_offerings.length}`);
      sec.course_offerings.forEach(o => {
        console.log(`      - Offering ${o.id.substring(0, 10)}... (linked to section: ${o.sections?.section_name})`);
      });
    });
    console.log('\n' + '-'.repeat(60));
  }

  await prisma.$disconnect();
}

checkAll();
