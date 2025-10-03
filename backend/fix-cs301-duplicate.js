const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

async function fixDuplicate() {
  try {
    console.log('\nÌ¥ß Fixing CS301 Section C Duplicate\n');
    console.log('='.repeat(80) + '\n');

    // The duplicate offering ID (the one without teacher)
    const duplicateId = 'd3b7bb1a-8fde-47c3-86b2-62e32919b0b1';
    
    // The correct offering ID (the one with teacher)
    const correctId = '31327cca-dc70-4e6e-8e73-0f7b4bc39fee';

    // Move students from duplicate to correct offering
    console.log('Moving students from duplicate to correct offering...');
    const enrollments = await prisma.studentEnrollment.findMany({
      where: { offeringId: duplicateId }
    });

    console.log(`Found ${enrollments.length} students in duplicate offering`);

    for (const enrollment of enrollments) {
      // Check if student already enrolled in correct offering
      const existing = await prisma.studentEnrollment.findFirst({
        where: {
          studentId: enrollment.studentId,
          offeringId: correctId
        }
      });

      if (!existing) {
        await prisma.studentEnrollment.update({
          where: { id: enrollment.id },
          data: { offeringId: correctId }
        });
        console.log(`  Moved student ${enrollment.studentId.substring(0, 8)}...`);
      } else {
        // Delete duplicate enrollment
        await prisma.studentEnrollment.delete({
          where: { id: enrollment.id }
        });
        console.log(`  Deleted duplicate enrollment for student ${enrollment.studentId.substring(0, 8)}...`);
      }
    }

    // Delete the duplicate offering
    console.log('\nDeleting duplicate offering...');
    await prisma.courseOffering.delete({
      where: { id: duplicateId }
    });

    console.log('‚úÖ Duplicate offering deleted!\n');

    // Verify
    const cs301 = await prisma.course.findFirst({
      where: { code: 'CS301' }
    });

    const offerings = await prisma.courseOffering.findMany({
      where: {
        courseId: cs301.id,
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

    console.log('Final CS301 Offerings:\n');
    offerings.forEach((o, idx) => {
      console.log(`${idx + 1}. Section ${o.sections?.section_name}: ${o._count.enrollments} students`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('‚úÖ Fix Complete!\n');

  } catch (error) {
    console.error('‚ùå Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDuplicate();
