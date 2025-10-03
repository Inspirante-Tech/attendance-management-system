const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

async function check() {
  const offerings = await prisma.courseOffering.findMany({
    where: { semester: 5 },
    include: { sections: true, courses: true }
  });
  
  console.log('\nAll Semester 5 offerings:\n');
  offerings.forEach(o => {
    console.log(`${o.courses.code} - Section ${o.sections?.section_name || 'NULL'} - ID: ${o.id.substring(0, 8)}`);
  });
  
  await prisma.$disconnect();
}

check();
