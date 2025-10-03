const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

async function redistributeStudents() {
  console.log('\nÌ¥Ñ REDISTRIBUTING STUDENTS TO CORRECT COLLEGE OFFERINGS\n');
  console.log('='.repeat(80) + '\n');

  // Get all CS301 offerings with enrollments
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
              colleges: true
            }
          }
        }
      }
    }
  });

  console.log(`Found ${offerings.length} CS301 offerings\n`);

  let moved = 0;
  let deleted = 0;

  for (const offering of offerings) {
    const offeringCollege = offering.course.department.colleges.code;
    const sectionName = offering.sections?.section_name;

    console.log(`\n${offeringCollege} Section ${sectionName}:`);
    console.log(`  Enrollments: ${offering.enrollments.length}`);

    for (const enrollment of offering.enrollments) {
      const student = enrollment.student;
      const studentCollege = student.colleges.code;
      const studentUSN = student.usn;

      // Check if student belongs to this offering's college
      if (studentCollege !== offeringCollege) {
        console.log(`  ‚ùå ${studentUSN} (${studentCollege}) - Wrong college!`);

        // Find correct offering for this student
        const correctOffering = offerings.find(o =>
          o.course.department.colleges.code === studentCollege &&
          o.sections?.section_name === sectionName
        );

        if (!correctOffering) {
          console.log(`     ‚ö†Ô∏è  No correct offering found for ${studentCollege} Section ${sectionName}`);
          continue;
        }

        // Check if already enrolled in correct offering
        const existing = await prisma.studentEnrollment.findFirst({
          where: {
            studentId: student.id,
            offeringId: correctOffering.id
          }
        });

        if (existing) {
          // Delete duplicate
          await prisma.studentEnrollment.delete({
            where: { id: enrollment.id }
          });
          console.log(`     Ì∑ëÔ∏è  Deleted duplicate enrollment`);
          deleted++;
        } else {
          // Move to correct offering
          await prisma.studentEnrollment.update({
            where: { id: enrollment.id },
            data: { offeringId: correctOffering.id }
          });
          console.log(`     ‚úÖ Moved to ${studentCollege} Section ${sectionName}`);
          moved++;
        }
      }
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`\nÌ≥ä SUMMARY:`);
  console.log(`   Moved: ${moved} students`);
  console.log(`   Deleted duplicates: ${deleted}`);
  console.log('\n' + '='.repeat(80) + '\n');

  await prisma.$disconnect();
}

redistributeStudents();
