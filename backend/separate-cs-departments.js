const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

async function separateDepartments() {
  console.log('\ní´§ SEPARATING CS301 OFFERINGS BY COLLEGE\n');
  console.log('='.repeat(80) + '\n');

  // Get both CS departments
  const nmit = await prisma.college.findFirst({ where: { code: 'NMIT' } });
  const nmamit = await prisma.college.findFirst({ where: { code: 'NMAMIT' } });

  const nmitCS = await prisma.department.findFirst({
    where: { code: 'CS', college_id: nmit.id }
  });

  const nmamitCS = await prisma.department.findFirst({
    where: { code: 'CS', college_id: nmamit.id }
  });

  console.log(`NMIT CS Dept: ${nmitCS.id.substring(0, 10)}...`);
  console.log(`NMAMIT CS Dept: ${nmamitCS.id.substring(0, 10)}...\n`);

  // Get CS301 courses for each department
  const nmitCS301 = await prisma.course.findFirst({
    where: { code: 'CS301', departmentId: nmitCS.id }
  });

  const nmamitCS301 = await prisma.course.findFirst({
    where: { code: 'CS301', departmentId: nmamitCS.id }
  });

  if (!nmitCS301 || !nmamitCS301) {
    console.log('âŒ CS301 courses not found for both colleges!');
    console.log(`NMIT CS301: ${nmitCS301 ? 'Found' : 'NOT FOUND'}`);
    console.log(`NMAMIT CS301: ${nmamitCS301 ? 'Found' : 'NOT FOUND'}`);
    return;
  }

  console.log(`âœ… Both CS301 courses found\n`);

  // Get sections for each college
  const nmitSections = await prisma.sections.findMany({
    where: { department_id: nmitCS.id },
    orderBy: { section_name: 'asc' }
  });

  const nmamitSections = await prisma.sections.findMany({
    where: { department_id: nmamitCS.id },
    orderBy: { section_name: 'asc' }
  });

  console.log(`NMIT Sections: ${nmitSections.map(s => s.section_name).join(', ')}`);
  console.log(`NMAMIT Sections: ${nmamitSections.map(s => s.section_name).join(', ')}\n`);

  // Get academic year
  const academicYear = await prisma.academic_years.findFirst({
    where: { is_active: true }
  });

  console.log(`Academic Year: ${academicYear.year_name}\n`);
  console.log('='.repeat(80) + '\n');

  // Create offerings for each college if they don't exist
  for (const section of nmitSections) {
    const existing = await prisma.courseOffering.findFirst({
      where: {
        courseId: nmitCS301.id,
        section_id: section.section_id,
        semester: 5
      }
    });

    if (!existing) {
      console.log(`Creating NMIT CS301 offering for Section ${section.section_name}...`);
      await prisma.courseOffering.create({
        data: {
          courseId: nmitCS301.id,
          section_id: section.section_id,
          semester: 5,
          year_id: academicYear.year_id
        }
      });
    } else {
      console.log(`âœ“ NMIT Section ${section.section_name} offering exists`);
    }
  }

  for (const section of nmamitSections) {
    const existing = await prisma.courseOffering.findFirst({
      where: {
        courseId: nmamitCS301.id,
        section_id: section.section_id,
        semester: 5
      }
    });

    if (!existing) {
      console.log(`Creating NMAMIT CS301 offering for Section ${section.section_name}...`);
      await prisma.courseOffering.create({
        data: {
          courseId: nmamitCS301.id,
          section_id: section.section_id,
          semester: 5,
          year_id: academicYear.year_id
        }
      });
    } else {
      console.log(`âœ“ NMAMIT Section ${section.section_name} offering exists`);
    }
  }

  console.log('\nâœ… All offerings created!\n');
  console.log('='.repeat(80) + '\n');

  await prisma.$disconnect();
}

separateDepartments();
