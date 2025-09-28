-- CreateEnum
CREATE TYPE "public"."attendance_status" AS ENUM ('present', 'absent');

-- CreateEnum
CREATE TYPE "public"."course_type" AS ENUM ('core', 'department_elective', 'open_elective');

-- CreateEnum
CREATE TYPE "public"."user_role" AS ENUM ('student', 'teacher', 'admin', 'report_viewer');

-- CreateTable
CREATE TABLE "public"."colleges" (
    "college_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "college_name" VARCHAR(150) NOT NULL,
    "college_code" VARCHAR(20) NOT NULL,
    "logo_url" TEXT,

    CONSTRAINT "colleges_pkey" PRIMARY KEY ("college_id")
);

-- CreateTable
CREATE TABLE "public"."departments" (
    "department_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "college_id" UUID NOT NULL,
    "department_name" VARCHAR(100) NOT NULL,
    "department_code" VARCHAR(10),

    CONSTRAINT "departments_pkey" PRIMARY KEY ("department_id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "user_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "username" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150),
    "password_hash" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(15),
    "photo_url" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "public"."user_roles" (
    "user_id" UUID NOT NULL,
    "role" "public"."user_role" NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id","role")
);

-- CreateTable
CREATE TABLE "public"."students" (
    "student_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "college_id" UUID NOT NULL,
    "department_id" UUID,
    "section_id" UUID,
    "usn" VARCHAR(20) NOT NULL,
    "semester" INTEGER,
    "batch_year" INTEGER NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("student_id")
);

-- CreateTable
CREATE TABLE "public"."teachers" (
    "teacher_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "college_id" UUID NOT NULL,
    "department_id" UUID,

    CONSTRAINT "teachers_pkey" PRIMARY KEY ("teacher_id")
);

-- CreateTable
CREATE TABLE "public"."courses" (
    "course_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "college_id" UUID NOT NULL,
    "course_code" VARCHAR(20) NOT NULL,
    "course_name" VARCHAR(100) NOT NULL,
    "department_id" UUID,
    "course_type" "public"."course_type",
    "has_theory_component" BOOLEAN NOT NULL DEFAULT true,
    "has_lab_component" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("course_id")
);

-- CreateTable
CREATE TABLE "public"."department_elective_groups" (
    "group_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "college_id" UUID NOT NULL,
    "group_name" VARCHAR(150) NOT NULL,
    "department_id" UUID NOT NULL,
    "semester" INTEGER NOT NULL,
    "batch_year" INTEGER NOT NULL,

    CONSTRAINT "department_elective_groups_pkey" PRIMARY KEY ("group_id")
);

-- CreateTable
CREATE TABLE "public"."course_elective_group_members" (
    "group_id" UUID NOT NULL,
    "course_id" UUID NOT NULL,

    CONSTRAINT "course_elective_group_members_pkey" PRIMARY KEY ("group_id","course_id")
);

-- CreateTable
CREATE TABLE "public"."open_elective_restrictions" (
    "restriction_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "course_id" UUID,
    "restricted_department_id" UUID NOT NULL,

    CONSTRAINT "open_elective_restrictions_pkey" PRIMARY KEY ("restriction_id")
);

-- CreateTable
CREATE TABLE "public"."course_offerings" (
    "offering_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "course_id" UUID NOT NULL,
    "teacher_id" UUID,
    "section_id" UUID,
    "year_id" UUID,
    "semester" INTEGER,

    CONSTRAINT "course_offerings_pkey" PRIMARY KEY ("offering_id")
);

-- CreateTable
CREATE TABLE "public"."student_enrollments" (
    "enrollment_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "student_id" UUID,
    "offering_id" UUID,
    "attempt_number" INTEGER DEFAULT 1,
    "year_id" UUID,

    CONSTRAINT "student_enrollments_pkey" PRIMARY KEY ("enrollment_id")
);

-- CreateTable
CREATE TABLE "public"."attendance" (
    "attendance_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "offering_id" UUID,
    "teacher_id" UUID,
    "class_date" DATE NOT NULL,
    "period_number" INTEGER,
    "syllabus_covered" TEXT,
    "status" VARCHAR(20) DEFAULT 'held',

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("attendance_id")
);

-- CreateTable
CREATE TABLE "public"."attendance_records" (
    "record_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "attendance_id" UUID,
    "student_id" UUID,
    "status" "public"."attendance_status",

    CONSTRAINT "attendance_records_pkey" PRIMARY KEY ("record_id")
);

-- CreateTable
CREATE TABLE "public"."theory_marks" (
    "marks_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "enrollment_id" UUID NOT NULL,
    "mse1_marks" SMALLINT,
    "mse2_marks" SMALLINT,
    "mse3_marks" SMALLINT,
    "task1_marks" SMALLINT,
    "task2_marks" SMALLINT,
    "task3_marks" SMALLINT,
    "last_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "theory_marks_pkey" PRIMARY KEY ("marks_id")
);

-- CreateTable
CREATE TABLE "public"."lab_marks" (
    "marks_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "enrollment_id" UUID NOT NULL,
    "record_marks" SMALLINT,
    "continuous_evaluation_marks" SMALLINT,
    "lab_mse_marks" SMALLINT,
    "last_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lab_marks_pkey" PRIMARY KEY ("marks_id")
);

-- CreateTable
CREATE TABLE "public"."admins" (
    "admin_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("admin_id")
);

-- CreateTable
CREATE TABLE "public"."report_viewers" (
    "viewer_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,

    CONSTRAINT "report_viewers_pkey" PRIMARY KEY ("viewer_id")
);

-- CreateTable
CREATE TABLE "public"."academic_years" (
    "year_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "college_id" UUID NOT NULL,
    "year_name" VARCHAR(10) NOT NULL,
    "start_date" DATE,
    "end_date" DATE,
    "is_active" BOOLEAN DEFAULT false,

    CONSTRAINT "academic_years_pkey" PRIMARY KEY ("year_id")
);

-- CreateTable
CREATE TABLE "public"."sections" (
    "section_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "department_id" UUID NOT NULL,
    "section_name" VARCHAR(10) NOT NULL,

    CONSTRAINT "sections_pkey" PRIMARY KEY ("section_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "colleges_college_name_key" ON "public"."colleges"("college_name");

-- CreateIndex
CREATE UNIQUE INDEX "colleges_college_code_key" ON "public"."colleges"("college_code");

-- CreateIndex
CREATE UNIQUE INDEX "departments_college_id_department_code_key" ON "public"."departments"("college_id", "department_code");

-- CreateIndex
CREATE UNIQUE INDEX "departments_college_id_department_name_key" ON "public"."departments"("college_id", "department_name");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "students_user_id_key" ON "public"."students"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "students_usn_key" ON "public"."students"("usn");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_user_id_key" ON "public"."teachers"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "courses_college_id_course_code_key" ON "public"."courses"("college_id", "course_code");

-- CreateIndex
CREATE UNIQUE INDEX "department_elective_groups_college_id_group_name_department_key" ON "public"."department_elective_groups"("college_id", "group_name", "department_id", "semester", "batch_year");

-- CreateIndex
CREATE UNIQUE INDEX "open_elective_restrictions_course_id_restricted_department__key" ON "public"."open_elective_restrictions"("course_id", "restricted_department_id");

-- CreateIndex
CREATE UNIQUE INDEX "theory_marks_enrollment_id_key" ON "public"."theory_marks"("enrollment_id");

-- CreateIndex
CREATE UNIQUE INDEX "lab_marks_enrollment_id_key" ON "public"."lab_marks"("enrollment_id");

-- CreateIndex
CREATE UNIQUE INDEX "admins_user_id_key" ON "public"."admins"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "report_viewers_user_id_key" ON "public"."report_viewers"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "academic_years_college_id_year_name_key" ON "public"."academic_years"("college_id", "year_name");

-- CreateIndex
CREATE UNIQUE INDEX "sections_department_id_section_name_key" ON "public"."sections"("department_id", "section_name");

-- AddForeignKey
ALTER TABLE "public"."departments" ADD CONSTRAINT "departments_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "public"."colleges"("college_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."students" ADD CONSTRAINT "students_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "public"."colleges"("college_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."students" ADD CONSTRAINT "students_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("department_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."students" ADD CONSTRAINT "students_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("section_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."students" ADD CONSTRAINT "students_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."teachers" ADD CONSTRAINT "teachers_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "public"."colleges"("college_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."teachers" ADD CONSTRAINT "teachers_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("department_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."teachers" ADD CONSTRAINT "teachers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."courses" ADD CONSTRAINT "courses_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "public"."colleges"("college_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."courses" ADD CONSTRAINT "courses_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("department_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."department_elective_groups" ADD CONSTRAINT "department_elective_groups_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "public"."colleges"("college_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."department_elective_groups" ADD CONSTRAINT "department_elective_groups_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("department_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."course_elective_group_members" ADD CONSTRAINT "course_elective_group_members_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("course_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."course_elective_group_members" ADD CONSTRAINT "course_elective_group_members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."department_elective_groups"("group_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."open_elective_restrictions" ADD CONSTRAINT "open_elective_restrictions_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("course_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."open_elective_restrictions" ADD CONSTRAINT "open_elective_restrictions_restricted_department_id_fkey" FOREIGN KEY ("restricted_department_id") REFERENCES "public"."departments"("department_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."course_offerings" ADD CONSTRAINT "course_offerings_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("course_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."course_offerings" ADD CONSTRAINT "course_offerings_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("section_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."course_offerings" ADD CONSTRAINT "course_offerings_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("teacher_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."course_offerings" ADD CONSTRAINT "course_offerings_year_id_fkey" FOREIGN KEY ("year_id") REFERENCES "public"."academic_years"("year_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."student_enrollments" ADD CONSTRAINT "student_enrollments_offering_id_fkey" FOREIGN KEY ("offering_id") REFERENCES "public"."course_offerings"("offering_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."student_enrollments" ADD CONSTRAINT "student_enrollments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("student_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."student_enrollments" ADD CONSTRAINT "student_enrollments_year_id_fkey" FOREIGN KEY ("year_id") REFERENCES "public"."academic_years"("year_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."attendance" ADD CONSTRAINT "attendance_offering_id_fkey" FOREIGN KEY ("offering_id") REFERENCES "public"."course_offerings"("offering_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."attendance" ADD CONSTRAINT "attendance_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("teacher_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."attendance_records" ADD CONSTRAINT "attendance_records_attendance_id_fkey" FOREIGN KEY ("attendance_id") REFERENCES "public"."attendance"("attendance_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."attendance_records" ADD CONSTRAINT "attendance_records_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("student_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."theory_marks" ADD CONSTRAINT "theory_marks_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "public"."student_enrollments"("enrollment_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."lab_marks" ADD CONSTRAINT "lab_marks_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "public"."student_enrollments"("enrollment_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."admins" ADD CONSTRAINT "admins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."report_viewers" ADD CONSTRAINT "report_viewers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."academic_years" ADD CONSTRAINT "academic_years_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "public"."colleges"("college_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."sections" ADD CONSTRAINT "sections_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("department_id") ON DELETE CASCADE ON UPDATE NO ACTION;
