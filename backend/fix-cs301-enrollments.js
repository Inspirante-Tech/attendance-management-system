const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

async function fixEnrollments() {
  try {
    console.log('\nÌ¥ß FIXING CS301 ENROLLMENTS\n');
    console.log('='.repeat(80) + '\n');

    // Get all CS301 offerings
    const offerings = await prisma.courseOffering.findMany({
      where: {
        course: { code: 'CS301' },
        semester: 5
      },
      include: {
        sections: true,
        enrollments: true
      },
      orderBy: {
        sections: { section_name: 'asc' }
      }
    });

    console.log(`Found ${offerings.length} CS301 offerings:\n`);
    offerings.forEach((o, i) => {
      console.log(`${i + 1}. Section ${o.sections?.section_name}: ${o.enrollments.length} students, Teacher: ${o.teacherId ? 'Yes' : 'No'}, ID: ${o.id.substring(0, 10)}`);
    });

    // Delete empty duplicate Section A
    const emptyA = offerings.find(o => o.sections?.section_name === 'A' && o.enrollments.length === 0);
    if (emptyA) {
      console.log(`\nÌ∑ëÔ∏è  Deleting empty Section A duplicate: ${emptyA.id.substring(0, 10)}`);
      await prisma.courseOffering.delete({ where: { id: emptyA.id } });
      console.log('   ‚úÖ Deleted');
    }

    // Get the correct offerings
    const offeringA = offerings.find(o => o.sections?.section_name === 'A' && o.enrollments.length > 0);
    const offeringB = offerings.find(o => o.sections?.section_name === 'B');
    const offeringC = offerings.find(o => o.sections?.section_name === 'C');

    console.log('\nÌ≥ä Correct Offerings:');
    console.log(`   Section A: ${offeringA?.id.substring(0, 10)}`);
    console.log(`   Section B: ${offeringB?.id.substring(0, 10)}`);
    console.log(`   Section C: ${offeringC?.id.substring(0, 10)}`);

    // Get all students by section
    const studentsA = await prisma.student.findMany({
      where: {
        semester: 5,
        departments: { code: 'CS' },
        sections: { section_name: 'A' }
      }
    });

    const studentsC = await prisma.student.findMany({
      where: {
        semester: 5,
        departments: { code: 'CS' },
        sections: { section_name: 'C' }
      }
    });

    console.log(`\nÌ≥ù Students Found:`);
    console.log(`   Section A: ${studentsA.length} students`);
    console.log(`   Section C: ${studentsC.length} students`);

    // Move misplaced Section A students from Section C offering to Section A offering
    if (offeringC && offeringA) {
      console.log(`\nÌ¥Ñ Moving Section A students from Section C offering to Section A offering...`);
      
      const misplacedEnrollments = await prisma.studentEnrollment.findMany({
        where: {
          offeringId: offeringC.id,
          student: {
            sections: { section_name: 'A' }
          }
        },
        include: {
          student: true
        }
      });

      console.log(`   Found ${misplacedEnrollments.length} misplaced enrollments`);

      for (const enrollment of misplacedEnrollments) {
        // Check if already in correct offering
        const existing = await prisma.studentEnrollment.findFirst({
          where: {
            studentId: enrollment.studentId,
            offeringId: offeringA.id
          }
        });

        if (!existing) {
          await prisma.studentEnrollment.update({
            where: { id: enrollment.id },
            data: { offeringId: offeringA.id }
          });
          console.log(`   ‚úÖ Moved ${enrollment.student.usn} to Section A offering`);
        } else {
          await prisma.studentEnrollment.delete({
            where: { id: enrollment.id }
          });
          console.log(`   ‚úÖ Deleted duplicate enrollment for ${enrollment.student.usn}`);
        }
      }
    }

    // Enroll all Section C students in Section C offering
    if (offeringC) {
      console.log(`\nÌ≥• Enrolling Section C students...`);
      
      for (const student of studentsC) {
        const existing = await prisma.studentEnrollment.findFirst({
          where: {
            studentId: student.id,
            offering: {
              course: { code: 'CS301' }
            }
          }
        });

        if (!existing) {
          await prisma.studentEnrollment.create({
            data: {
              studentId: student.id,
              offeringId: offeringC.id,
              attemptNumber: 1
            }
          });
          console.log(`   ‚úÖ Enrolled ${student.usn} in Section C`);
        } else {
          console.log(`   ‚ÑπÔ∏è  ${student.usn} already enrolled`);
        }
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n‚úÖ FIX COMPLETE! Verifying...\n');

    // Verify
    const finalOfferings = await prisma.courseOffering.findMany({
      where: {
        course: { code: 'CS301' },
        semester: 5
      },
      include: {
        sections: true,
        _count: { select: { enrollments: true } }
      },
      orderBy: {
        sections: { section_name: 'asc' }
      }
    });

    console.log('Ì≥ä Final State:\n');
    finalOfferings.forEach(o => {
      console.log(`   Section ${o.sections?.section_name}: ${o._count.enrollments} students enrolled`);
    });

    console.log('\n' + '='.repeat(80) + '\n');

  } catch (error) {
    console.error('\n‚ùå Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

fixEnrollments();
