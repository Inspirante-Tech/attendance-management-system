// routes/studentInfo.ts
import express from "express";
import DatabaseService from '../../lib/database'; 
// Adjust the import path as necessary


const router = express.Router();

//testing purposeo only
// router.get('/students/101', (req, res) => {
//   res.send('Student info here');
// });

// GET /students/:studentId
router.get("/students/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;   //gets the studentId from the url

    if (!studentId) {
      return res.status(400).json({ error: "studentId is required" }); // checks whether the studentId is valid or present
    }

    const prisma = DatabaseService.getInstance();

// 1. Get student row
const student = await prisma.student.findUnique({
  where: { id: studentId }
});

if (!student) {
  return res.status(404).json({ error: "Student not found" });
}

// 2. Get user row
const user = await prisma.user.findUnique({
  where: { id: student.userId }
});

// 3. Get department row
const department = await prisma.department.findUnique({
  where: { id: student.department_id as string }
});

let studentData =null
// 4. Shape the final data
if(user && department) {
       studentData = {
    user_id: user.id,
    name: user.name,
    usn: user.username,
  phone: user.phone,
  email: user.email,
  college_name: student.college_id,
  semester: student.semester,
  department: department?.name || null,
  academic_year:student.batchYear,
  photo_url: user.photoUrl || "" ,
}}else{
  studentData = {
    user_id: null,
    name: null,
    usn: null,
    phone: null,
    email: null,
    college_name: null,
    semester: null,
    department: null,
    photo_url: null
  };
}

res.json({ studentData });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;  
