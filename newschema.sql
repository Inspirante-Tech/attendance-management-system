-- Inspirante Attendance Management System - Database Schema

-- Colleges Table
CREATE TABLE colleges (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL
);

-- Departments Table
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    college_id INTEGER NOT NULL REFERENCES colleges(id)
);

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL
);

-- User Roles Table
CREATE TABLE user_role_assignments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    role VARCHAR(20) NOT NULL -- 'student', 'teacher', 'admin'
);

-- Students Table
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    college_id INTEGER NOT NULL REFERENCES colleges(id),
    department_id INTEGER REFERENCES departments(id),
    section_id INTEGER REFERENCES sections(section_id),
    usn VARCHAR(50) UNIQUE,
    semester INTEGER,
    batch_year INTEGER
);

-- Teachers Table
CREATE TABLE teachers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    college_id INTEGER NOT NULL REFERENCES colleges(id),
    department_id INTEGER REFERENCES departments(id)
);

-- Admins Table
CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id)
);

-- Sections Table
CREATE TABLE sections (
    section_id SERIAL PRIMARY KEY,
    section_name VARCHAR(50) NOT NULL,
    department_id INTEGER REFERENCES departments(id)
);

-- Courses Table
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    year INTEGER NOT NULL,
    department_id INTEGER NOT NULL REFERENCES departments(id),
    type VARCHAR(30) NOT NULL, -- 'core', 'department_elective', 'open_elective'
    has_theory_component BOOLEAN DEFAULT TRUE,
    has_lab_component BOOLEAN DEFAULT FALSE
);

-- Course Offerings Table
CREATE TABLE course_offerings (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id),
    teacher_id INTEGER REFERENCES teachers(id),
    academic_year VARCHAR(20) NOT NULL,
    semester INTEGER NOT NULL
);

-- Open Elective Restrictions Table
CREATE TABLE open_elective_restrictions (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id),
    restricted_department_id INTEGER NOT NULL REFERENCES departments(id)
);

-- Enrollments Table
CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id),
    offering_id INTEGER NOT NULL REFERENCES course_offerings(id)
);

-- Attendance Table
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    offering_id INTEGER NOT NULL REFERENCES course_offerings(id),
    date DATE NOT NULL
);

-- Attendance Records Table
CREATE TABLE attendance_records (
    id SERIAL PRIMARY KEY,
    attendance_id INTEGER NOT NULL REFERENCES attendance(id),
    student_id INTEGER NOT NULL REFERENCES students(id),
    status VARCHAR(20) NOT NULL -- 'present', 'absent', etc.
);

-- Theory Marks Table
CREATE TABLE theory_marks101 (
    id SERIAL PRIMARY KEY,
    enrollment_id INTEGER NOT NULL REFERENCES enrollments(id),
    marks INTEGER
);

-- Lab Marks Table
CREATE TABLE lab_marks (
    id SERIAL PRIMARY KEY,
    enrollment_id INTEGER NOT NULL REFERENCES enrollments(id),
    marks INTEGER
);

-- Academic Years Table
CREATE TABLE academic_years (
    id SERIAL PRIMARY KEY,
    year VARCHAR(20) UNIQUE NOT NULL
);

-- User Roles Table (for reference values)
-- Possible values: 'student', 'teacher', 'admin'
