const { PrismaClient } = require("./generated/prisma");
const prisma = new PrismaClient();

async function cleanAllDuplicates() {
  try {
    console.log("\n🧹 AUTOMATIC DUPLICATE CLEANUP FOR ALL COURSES\n");
    console.log("=".repeat(80) + "\n");

    // Get all semester 5 offerings
    const offerings = await prisma.courseOffering.findMany({
      where: { semester: 5 },
      include: {
        course: true,
        sections: true,
        _count: { select: { enrollments: true } },
      },
    });

    console.log(`📊 Found ${offerings.length} total offerings\n`);

    // Group by course + section
    const groups = {};
    offerings.forEach((o) => {
      const key = `${o.course.code}___${o.sections?.section_name || "NULL"}`;
      if (!groups[key]) {
        groups[key] = {
          courseCode: o.course.code,
          courseName: o.course.name,
          section: o.sections?.section_name || "NULL",
          list: [],
        };
      }
      groups[key].list.push(o);
    });

    // Find duplicates
    const duplicates = Object.entries(groups).filter(
      ([_, g]) => g.list.length > 1
    );

    console.log(`✅ Clean: ${Object.keys(groups).length - duplicates.length}`);
    console.log(`❌ Duplicates: ${duplicates.length}\n`);

    if (duplicates.length === 0) {
      console.log("No duplicates to clean!\n");
      return;
    }

    const toDelete = [];

    console.log("=".repeat(80));
    console.log("\nDUPLICATE ANALYSIS:\n");

    // Analyze each duplicate group
    for (const [key, group] of duplicates.sort()) {
      console.log(
        `\n📚 ${group.courseCode} Section ${group.section}: ${group.list.length} offerings`
      );

      // Sort: Keep offerings with teacher first, then most students
      const sorted = [...group.list].sort((a, b) => {
        if (a.teacherId && !b.teacherId) return -1;
        if (!a.teacherId && b.teacherId) return 1;
        return b._count.enrollments - a._count.enrollments;
      });

      const keep = sorted[0];
      const deleteList = sorted.slice(1);

      console.log(
        `   ✅ Keep: ${keep.id.substring(0, 10)} (${
          keep._count.enrollments
        } students, ${keep.teacherId ? "Has teacher" : "No teacher"})`
      );

      deleteList.forEach((d, i) => {
        console.log(
          `   ❌ Delete #${i + 1}: ${d.id.substring(0, 10)} (${
            d._count.enrollments
          } students, ${d.teacherId ? "Has teacher" : "No teacher"})`
        );
        toDelete.push({
          id: d.id,
          keepId: keep.id,
          students: d._count.enrollments,
          course: group.courseCode,
          section: group.section,
        });
      });
    }

    console.log("\n" + "=".repeat(80));
    console.log(`\n🗑️  DELETING ${toDelete.length} DUPLICATES...\n`);

    let success = 0;
    let failed = 0;

    // Execute deletions
    for (const item of toDelete) {
      try {
        process.stdout.write(
          `${item.course} Sec ${item.section} (${item.id.substring(0, 8)}): `
        );

        // Move enrollments
        if (item.students > 0) {
          const enrolls = await prisma.studentEnrollment.findMany({
            where: { offeringId: item.id },
          });

          for (const e of enrolls) {
            const exists = await prisma.studentEnrollment.findFirst({
              where: { studentId: e.studentId, offeringId: item.keepId },
            });

            if (!exists) {
              await prisma.studentEnrollment.update({
                where: { id: e.id },
                data: { offeringId: item.keepId },
              });
            } else {
              await prisma.studentEnrollment.delete({ where: { id: e.id } });
            }
          }
        }

        // Delete attendance
        await prisma.attendance.deleteMany({ where: { offeringId: item.id } });

        // Delete offering
        await prisma.courseOffering.delete({ where: { id: item.id } });

        console.log("✅ Deleted");
        success++;
      } catch (err) {
        console.log(`❌ Failed: ${err.message}`);
        failed++;
      }
    }

    console.log("\n" + "=".repeat(80));
    console.log("\n📊 RESULTS:");
    console.log(`   ✅ Successfully deleted: ${success}`);
    console.log(`   ❌ Failed: ${failed}\n`);

    // Verify
    console.log("🔍 VERIFICATION:\n");
    const final = await prisma.courseOffering.findMany({
      where: { semester: 5 },
      include: { course: true, sections: true },
    });

    const finalGroups = {};
    final.forEach((o) => {
      const key = `${o.course.code}_${o.sections?.section_name || "NULL"}`;
      finalGroups[key] = (finalGroups[key] || 0) + 1;
    });

    const remaining = Object.entries(finalGroups).filter(([_, c]) => c > 1);

    if (remaining.length === 0) {
      console.log("   ✅ ALL CLEAN! No duplicates remaining.\n");
    } else {
      console.log(`   ⚠️  ${remaining.length} duplicates still exist:\n`);
      remaining.forEach(([k, c]) => console.log(`      ${k}: ${c} offerings`));
      console.log("");
    }

    console.log("=".repeat(80) + "\n");
  } catch (error) {
    console.error("\n❌ ERROR:", error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanAllDuplicates();
