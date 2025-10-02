/*
  Warnings:

  - You are about to drop the column `college_id` on the `courses` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[department_id,course_code]` on the table `courses` will be added. If there are existing duplicate values, this will fail.
  - Made the column `department_id` on table `courses` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "public"."attendance_status" ADD VALUE 'unmarked';

-- DropForeignKey
ALTER TABLE "public"."courses" DROP CONSTRAINT "courses_college_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."courses" DROP CONSTRAINT "courses_department_id_fkey";

-- DropIndex
DROP INDEX "public"."courses_college_id_course_code_key";

-- AlterTable
ALTER TABLE "public"."courses" DROP COLUMN "college_id",
ALTER COLUMN "department_id" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "courses_department_id_course_code_key" ON "public"."courses"("department_id", "course_code");

-- AddForeignKey
ALTER TABLE "public"."courses" ADD CONSTRAINT "courses_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("department_id") ON DELETE RESTRICT ON UPDATE NO ACTION;
