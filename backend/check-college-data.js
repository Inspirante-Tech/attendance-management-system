const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

async function checkData() {
  const colleges = await prisma.college.findMany({
    include: {
      departments: {
        where: { code: 'CS' },
        include: {
          sections: {
            orderBy: { section_name: 'asc' }
          }
        }
      }
    }
  });

  console.log('\ní³Š COLLEGE DATA:\n');
  for (const college of colleges) {
    console.log(`${college.name} (${college.code}):`);
    for (const dept of college.departments) {
      console.log(`  Department: ${dept.name} (${dept.code})`);
      console.log(`  Sections:`);
      dept.sections.forEach(s => {
        console.log(`    ${s.section_name}: ${s.section_id.substring(0, 10)}...`);
      });
    }
    console.log('');
  }

  await prisma.$disconnect();
}

checkData();
