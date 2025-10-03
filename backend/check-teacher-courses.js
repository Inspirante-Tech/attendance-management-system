const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkCourseOfferings() {
  try {
    console.log("=== Checking Course Offerings for CS Teacher 1 ===\n");

    // Find CS Teacher 1
    const teacher = await prisma.teacher.findFirst({
      where: {
        user: {
          name: {
            contains: "CS Teacher 1",
            mode: "insensitive",
          },
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!teacher) {
      console.log("CS Teacher 1 not found!");
      return;
    }

    console.log(
      `Teacher Found: ${teacher.user.name} (${teacher.user.email})\n`
    );

    // Get their course offerings
    const offerings = await prisma.courseOffering.findMany({
      where: {
        teacherId: teacher.id,
      },
      include: {
        course: {
          select: {
            name: true,
            code: true,
          },
        },
        sections: {
          select: {
            section_name: true,
          },
        },
        academic_years: {
          select: {
            year_name: true,
          },
        },
        enrollments: {
          take: 3,
          include: {
            student: {
              include: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    console.log(`Found ${offerings.length} course offering(s):\n`);

    offerings.forEach((offering, index) => {
      console.log(
        `${index + 1}. Course: ${offering.course.code} - ${
          offering.course.name
        }`
      );
      console.log(`   Section: ${offering.sections?.section_name || "N/A"}`);
      console.log(
        `   Academic Year: ${offering.academic_years?.year_name || "N/A"}`
      );
      console.log(`   Semester: ${offering.semester || "N/A"}`);
      console.log(`   Total Enrollments: ${offering.enrollments.length}`);

      if (offering.enrollments.length > 0) {
        console.log(`   Sample Students:`);
        offering.enrollments.forEach((enrollment) => {
          if (enrollment.student) {
            console.log(
              `     - ${enrollment.student.usn} - ${enrollment.student.user.name}`
            );
          }
        });
      }
      console.log("");
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCourseOfferings();
