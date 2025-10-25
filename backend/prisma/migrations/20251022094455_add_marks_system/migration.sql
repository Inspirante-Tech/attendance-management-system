/*
  Warnings:

  - You are about to drop the `lab_marks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `theory_marks` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."test_type" AS ENUM ('theory', 'lab');

-- DropForeignKey
ALTER TABLE "public"."lab_marks" DROP CONSTRAINT "lab_marks_enrollment_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."theory_marks" DROP CONSTRAINT "theory_marks_enrollment_id_fkey";

-- DropTable
DROP TABLE "public"."lab_marks";

-- DropTable
DROP TABLE "public"."theory_marks";

-- CreateTable
CREATE TABLE "public"."test_components" (
    "test_component_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "course_offering_id" UUID NOT NULL,
    "test_name" VARCHAR(50) NOT NULL,
    "max_marks" INTEGER NOT NULL,
    "weightage" INTEGER NOT NULL DEFAULT 100,
    "type" "public"."test_type" NOT NULL DEFAULT 'theory',

    CONSTRAINT "test_components_pkey" PRIMARY KEY ("test_component_id")
);

-- CreateTable
CREATE TABLE "public"."student_marks" (
    "student_mark_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "enrollment_id" UUID NOT NULL,
    "test_component_id" UUID NOT NULL,
    "marks_obtained" INTEGER,

    CONSTRAINT "student_marks_pkey" PRIMARY KEY ("student_mark_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "student_marks_enrollment_id_test_component_id_key" ON "public"."student_marks"("enrollment_id", "test_component_id");

-- AddForeignKey
ALTER TABLE "public"."test_components" ADD CONSTRAINT "test_components_course_offering_id_fkey" FOREIGN KEY ("course_offering_id") REFERENCES "public"."course_offerings"("offering_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."student_marks" ADD CONSTRAINT "student_marks_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "public"."student_enrollments"("enrollment_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."student_marks" ADD CONSTRAINT "student_marks_test_component_id_fkey" FOREIGN KEY ("test_component_id") REFERENCES "public"."test_components"("test_component_id") ON DELETE CASCADE ON UPDATE NO ACTION;
