const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkAcademicYears() {
  try {
    console.log("=== Checking Academic Years in Course Offerings ===\n");

    // Get CS Teacher 1's offerings
    const teacher = await prisma.teacher.findFirst({
      where: { user: { name: "CS Teacher 1" } },
      include: { user: true },
    });

    if (!teacher) {
      console.log("CS Teacher 1 not found");
      return;
    }

    console.log(`Teacher: ${teacher.user.name} (ID: ${teacher.id})\n`);

    // Get their course offerings
    const offerings = await prisma.courseOffering.findMany({
      where: {
        teacherAssignments: {
          some: {
            teacherId: teacher.id,
          },
        },
      },
      include: {
        course: true,
        section: true,
        academicYear: true,
      },
    });

    console.log(`Found ${offerings.length} course offerings:\n`);

    offerings.forEach((offering, index) => {
      console.log(
        `${index + 1}. ${offering.course.name} (${offering.course.code})`
      );
      console.log(`   Section: ${offering.section.name}`);
      console.log(
        `   Academic Year: ${offering.academicYear.year} (Semester ${offering.academicYear.semester})`
      );
      console.log(`   Offering ID: ${offering.id}\n`);
    });

    // Check all academic years in the system
    console.log("=== All Academic Years in System ===\n");
    const allAcademicYears = await prisma.academicYear.findMany({
      orderBy: { year: "asc" },
    });

    allAcademicYears.forEach((ay) => {
      console.log(`${ay.year} - Semester ${ay.semester}`);
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAcademicYears();
