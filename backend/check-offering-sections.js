const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

async function checkOfferingSections() {
  try {
    console.log('\ní´ CHECKING CS301 OFFERING SECTION LINKS\n');
    console.log('='.repeat(80) + '\n');

    // Get all sections in CS department
    const sections = await prisma.sections.findMany({
      where: {
        departments: { code: 'CS' }
      },
      orderBy: {
        section_name: 'asc'
      }
    });

    console.log('Physical Sections in CS Department:\n');
    sections.forEach(s => {
      console.log(`  ${s.section_name}: ID = ${s.section_id.substring(0, 12)}...`);
    });

    // Get all CS301 offerings
    const offerings = await prisma.courseOffering.findMany({
      where: {
        course: { code: 'CS301' },
        semester: 5
      },
      include: {
        course: true,
        sections: true
      },
      orderBy: {
        sections: { section_name: 'asc' }
      }
    });

    console.log('\n\nCS301 Course Offerings:\n');
    offerings.forEach(o => {
      console.log(`Offering ID: ${o.id.substring(0, 12)}...`);
      console.log(`  section_id field: ${o.section_id?.substring(0, 12) || 'NULL'}...`);
      console.log(`  Linked to section: ${o.sections?.section_name || 'NULL'}`);
      console.log('');
    });

    console.log('='.repeat(80));
    console.log('\ní²¡ ANALYSIS:\n');
    
    const sectionAId = sections.find(s => s.section_name === 'A')?.section_id;
    const sectionBId = sections.find(s => s.section_name === 'B')?.section_id;
    const sectionCId = sections.find(s => s.section_name === 'C')?.section_id;

    console.log(`Section A ID: ${sectionAId?.substring(0, 12)}...`);
    console.log(`Section B ID: ${sectionBId?.substring(0, 12)}...`);
    console.log(`Section C ID: ${sectionCId?.substring(0, 12)}...`);

    console.log('\n\nOffering Section Matches:');
    offerings.forEach(o => {
      let match = 'UNKNOWN';
      if (o.section_id === sectionAId) match = 'Section A';
      if (o.section_id === sectionBId) match = 'Section B';
      if (o.section_id === sectionCId) match = 'Section C';
      console.log(`  ${o.id.substring(0, 8)}... -> ${match}`);
    });

    console.log('\n' + '='.repeat(80) + '\n');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkOfferingSections();
