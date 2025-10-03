const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

async function checkEnrollments() {
  try {
    console.log('\nÌ≥ä CS301 ENROLLMENT STATUS\n');
    console.log('='.repeat(80) + '\n');

    // Get CS301 offerings
    const offerings = await prisma.courseOffering.findMany({
      where: {
        course: { code: 'CS301' },
        semester: 5
      },
      include: {
        course: true,
        sections: true,
        enrollments: {
          include: {
            student: {
              include: {
                sections: true
              }
            }
          }
        }
      }
    });

    console.log(`Found ${offerings.length} CS301 offerings\n`);

    for (const offering of offerings) {
      console.log(`\nÌ≥ö Section ${offering.sections?.section_name || 'NULL'}`);
      console.log(`   Offering ID: ${offering.id.substring(0, 12)}...`);
      console.log(`   Teacher: ${offering.teacherId ? 'Assigned' : 'None'}`);
      console.log(`   Enrolled Students: ${offering.enrollments.length}\n`);

      if (offering.enrollments.length > 0) {
        offering.enrollments.forEach((e, i) => {
          console.log(`   ${i + 1}. ${e.student.usn} (Student Section: ${e.student.sections?.section_name || 'NULL'})`);
        });
      } else {
        console.log('   (No students enrolled)');
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('\nÌ≥ä STUDENT SECTION BREAKDOWN:\n');

    // Get all CS students in semester 5
    const allStudents = await prisma.student.findMany({
      where: {
        semester: 5,
        departments: {
          code: 'CS'
        }
      },
      include: {
        sections: true,
        enrollments: {
          where: {
            offering: {
              course: { code: 'CS301' }
            }
          }
        }
      },
      orderBy: {
        usn: 'asc'
      }
    });

    const bySection = {};
    allStudents.forEach(s => {
      const sec = s.sections?.section_name || 'NULL';
      if (!bySection[sec]) bySection[sec] = { total: 0, enrolled: 0, notEnrolled: [] };
      bySection[sec].total++;
      if (s.enrollments.length > 0) {
        bySection[sec].enrolled++;
      } else {
        bySection[sec].notEnrolled.push(s.usn);
      }
    });

    for (const [section, data] of Object.entries(bySection).sort()) {
      console.log(`Section ${section}:`);
      console.log(`   Total: ${data.total} students`);
      console.log(`   Enrolled in CS301: ${data.enrolled}`);
      console.log(`   NOT Enrolled: ${data.notEnrolled.length}`);
      if (data.notEnrolled.length > 0) {
        console.log(`   ‚Üí ${data.notEnrolled.join(', ')}`);
      }
      console.log('');
    }

    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('‚ùå Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkEnrollments();
