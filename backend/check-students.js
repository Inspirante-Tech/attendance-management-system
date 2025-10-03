const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkStudents() {
  try {
    console.log("=== Checking Students in Database ===\n");

    // Get first 10 students
    const students = await prisma.student.findMany({
      take: 10,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        section: {
          select: {
            section_name: true,
          },
        },
      },
      orderBy: {
        usn: "asc",
      },
    });

    console.log(`Found ${students.length} students (showing first 10):\n`);

    students.forEach((student, index) => {
      console.log(`${index + 1}. USN: ${student.usn}`);
      console.log(`   Name: ${student.user.name}`);
      console.log(`   Email: ${student.user.email}`);
      console.log(`   Section: ${student.section?.section_name || "N/A"}`);
      console.log(`   Semester: ${student.current_semester}\n`);
    });

    // Count total students
    const total = await prisma.student.count();
    console.log(`Total students in database: ${total}`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStudents();
