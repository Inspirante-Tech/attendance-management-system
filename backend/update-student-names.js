const { PrismaClient } = require("./generated/prisma");

const prisma = new PrismaClient();

// Common Indian first names
const firstNames = [
  "Aarav",
  "Vivaan",
  "Aditya",
  "Vihaan",
  "Arjun",
  "Sai",
  "Arnav",
  "Ayaan",
  "Krishna",
  "Ishaan",
  "Shaurya",
  "Atharva",
  "Advait",
  "Pranav",
  "Dhruv",
  "Aryan",
  "Kabir",
  "Shivansh",
  "Reyansh",
  "Rohan",
  "Ravi",
  "Karthik",
  "Varun",
  "Nikhil",
  "Rahul",
  "Amit",
  "Suresh",
  "Vijay",
  "Prakash",
  "Anil",
  "Aadhya",
  "Saanvi",
  "Ananya",
  "Diya",
  "Ira",
  "Pari",
  "Navya",
  "Aanya",
  "Myra",
  "Sara",
  "Kavya",
  "Avni",
  "Ishita",
  "Kiara",
  "Priya",
  "Neha",
  "Pooja",
  "Divya",
  "Shreya",
  "Anjali",
  "Lakshmi",
  "Meera",
  "Kavitha",
  "Sanjana",
  "Nisha",
  "Swati",
  "Rekha",
  "Deepika",
  "Anitha",
  "Sangeetha",
];

// Common Indian last names
const lastNames = [
  "Kumar",
  "Singh",
  "Patel",
  "Sharma",
  "Reddy",
  "Nair",
  "Iyer",
  "Rao",
  "Gupta",
  "Joshi",
  "Desai",
  "Kulkarni",
  "Mehta",
  "Shah",
  "Chopra",
  "Malhotra",
  "Kapoor",
  "Verma",
  "Agarwal",
  "Jain",
  "Bhat",
  "Shetty",
  "Kamath",
  "Hegde",
  "Naik",
  "Pai",
  "Amin",
  "Menon",
  "Pillai",
  "Krishnan",
  "Subramanian",
  "Sundaram",
  "Venkatesh",
  "Raman",
  "Natarajan",
  "Mukherjee",
  "Banerjee",
  "Chatterjee",
  "Das",
  "Ghosh",
  "Roy",
  "Bose",
  "Sengupta",
  "Chakraborty",
  "Dutta",
  "Bhattacharya",
];

// Function to generate a random Indian name
function generateIndianName() {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${firstName} ${lastName}`;
}

async function updateStudentNames() {
  try {
    console.log("🔄 Starting student name update...\n");

    // Get all students with their user data
    const students = await prisma.student.findMany({
      select: {
        id: true,
        usn: true,
        userId: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        usn: "asc",
      },
    });

    console.log(`📊 Found ${students.length} students to update\n`);

    // Track used names to avoid duplicates
    const usedNames = new Set();

    // Update each student
    let updatedCount = 0;
    for (const student of students) {
      // Generate unique name
      let newName;
      do {
        newName = generateIndianName();
      } while (usedNames.has(newName));

      usedNames.add(newName);

      // Update user name (not student name)
      await prisma.user.update({
        where: { id: student.userId },
        data: { name: newName },
      });

      console.log(
        `✅ Updated ${student.usn}: "${student.user.name}" → "${newName}"`
      );
      updatedCount++;
    }

    console.log(`\n✨ Successfully updated ${updatedCount} student names!`);
  } catch (error) {
    console.error("❌ Error updating student names:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updateStudentNames()
  .then(() => {
    console.log("\n✅ Script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  });
