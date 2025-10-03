const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

async function verify() {
  const offerings = await prisma.courseOffering.findMany({
    where: {
      course: { code: 'CS301' },
      semester: 5
    },
    include: {
      course: {
        include: {
          department: {
            include: {
              colleges: true
            }
          }
        }
      },
      sections: true,
      enrollments: {
        include: {
          student: {
            include: {
              colleges: true,
              sections: true
            }
          }
        }
      }
    }
  });

  console.log('\nÌ≥ä FINAL CS301 STATE:\n');
  console.log('='.repeat(80) + '\n');

  for (const offering of offerings) {
    const college = offering.course.department.colleges.code;
    const section = offering.sections?.section_name;
    
    console.log(`${college} Section ${section}:`);
    console.log(`  Offering ID: ${offering.id.substring(0, 12)}...`);
    console.log(`  Enrollments: ${offering.enrollments.length}`);
    
    if (offering.enrollments.length > 0) {
      offering.enrollments.forEach(e => {
        const studentCollege = e.student.colleges.code;
        const studentSection = e.student.sections?.section_name;
        const match = (studentCollege === college && studentSection === section) ? '‚úÖ' : '‚ùå';
        console.log(`    ${match} ${e.student.usn} (${studentCollege} Sec ${studentSection})`);
      });
    }
    console.log('');
  }

  console.log('='.repeat(80) + '\n');

  await prisma.$disconnect();
}

verify();
