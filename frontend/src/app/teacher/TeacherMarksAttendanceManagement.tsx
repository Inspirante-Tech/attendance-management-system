"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Save,
  Calendar,
  Users,
  BookOpen,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";
import { TeacherAPI, type CourseOffering } from "@/lib/teacher-api";

//interface for test components
interface StudentMarkComponent {
  componentId: string;
  componentName: string;
  type: "theory" | "lab" | string; // restrict if you know all possible types
  obtainedMarks: number | null;
  maxMarks: number;
  weightage: number;
}
// Types for marks and attendance
interface StudentMark {
  id: string;
  enrollmentId: string;
  usn: string;
  student_name: string;
  course_code: string;
  course_name: string;
  marks: StudentMarkComponent[]; // Combined marks for all components
  last_updated_at: string;
}

interface AttendanceRecord {
  id: string;
  date: string;
  studentId: string;
  usn: string;
  student_name: string;
  status: "present" | "absent" | "unmarked";
  courseId?: string;
  courseName?: string;
}

interface MarksAttendanceProps {
  courses: CourseOffering[];
  selectedCourseId: string;
  initialMode?: "marks" | "attendance";
  teacherId: string;
}
interface TestComponent {
    id: string;
    name: string;
    type: string;
    maxMarks: number;
    weightage: number;
    obtainedMarks: number;
}


export default function TeacherMarksAttendanceManagement({
  courses,
  teacherId,
  selectedCourseId,
  initialMode = "marks",
}: MarksAttendanceProps) {
  // State management
  const [activeTab, setActiveTab] = useState<"marks" | "attendance">(
    initialMode
  );
  //stores array of StudentMark objects fetched from the database
  const [marks, setMarks] = useState<StudentMark[]>([]);

  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [editingMarkId, setEditingMarkId] = useState<string | null>(null);
  const [editingMarkField, setEditingMarkField] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [currentMonth, setCurrentMonth] = useState<number>(
    new Date().getMonth()
  );
  const [currentYear, setCurrentYear] = useState<number>(
    new Date().getFullYear()
  );
  const [selectedCourse, setSelectedCourse] = useState<string>(
    selectedCourseId || "all"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [componentsTest, setComponentsTest] = useState<TestComponent[]>(
    []
  ); // to store test components structure
  const [componentsR, setComponentsR] = useState<true | false>(false);
  // Load data from database
useEffect(() => {
  const fetchComponents = async () => {
    try {
      const structureResponse = await TeacherAPI.getCourseTestComponents(
        selectedCourseId || "",
        teacherId
      );

      const components = structureResponse.components || [];
      console.log("Fetched components for course (initial load):", selectedCourseId, components);
      if (structureResponse.status === "success") { // check response status, not components.status
        setComponentsTest(components);
        setComponentsR(true);
        loadMarksData();
      }
    } catch (err) {
      console.error("Failed to fetch components", err);
    }
  };

  fetchComponents();
}, []);

  useEffect(() => {
    if (activeTab === "marks") {
      loadMarksData();
    } else {
      loadAttendanceData();
    }
  }, [activeTab, selectedDate, selectedCourse]);

  // const loadMarksData = async () => {
  //     setLoading(true)
  //     setError(null)
  //     try {
  //         // Get marks for courses assigned to teacher
  //         if (selectedCourse === 'all') {
  //             // Load marks for all teacher's courses
  //             const allMarks: StudentMark[] = []

  //             for (const course of courses) {
  //                 try {
  //                     // Get students for this course offering
  //                     const studentsResponse = await TeacherAPI.getCourseStudents(course.offeringId)

  //                     // For each student, get their marks
  //                     for (const studentData of studentsResponse) {
  //                         try {
  //                             const marksResponse = await TeacherAPI.getCourseStudentMarks(
  //                                 course.course.id, // courseId
  //                                 teacherid // studentUsn
  //                             )

  //                             if (marksResponse.status === 'success' && marksResponse.data.length > 0) {
  //                                 const item = marksResponse.students   // Should only be one result for specific USN and course

  //                                 const studentMark: StudentMark = {
  //                                     id: item.id,
  //                                     enrollmentId: item.enrollmentId,
  //                                     usn: item.student?.usn || studentData.student.usn,
  //                                     student_name: item.student?.user?.name || studentData.student.name,
  //                                     course_code: item.course?.code || course.course.code,
  //                                     course_name: item.course?.name || course.course.name,
  //                                     // Theory marks
  //                                     mse1_marks: item.theoryMarks?.mse1_marks || null,
  //                                     mse2_marks: item.theoryMarks?.mse2_marks || null,
  //                                     mse3_marks: item.theoryMarks?.mse3_marks || null,
  //                                     task1_marks: item.theoryMarks?.task1_marks || null,
  //                                     task2_marks: item.theoryMarks?.task2_marks || null,
  //                                     task3_marks: item.theoryMarks?.task3_marks || null,
  //                                     theory_total: (item.theoryMarks?.mse1_marks || 0) + (item.theoryMarks?.mse2_marks || 0) +
  //                                         (item.theoryMarks?.mse3_marks || 0) + (item.theoryMarks?.task1_marks || 0) +
  //                                         (item.theoryMarks?.task2_marks || 0) + (item.theoryMarks?.task3_marks || 0),
  //                                     // Lab marks
  //                                     record_marks: item.labMarks?.record_marks || null,
  //                                     continuous_evaluation_marks: item.labMarks?.continuous_evaluation_marks || null,
  //                                     lab_mse_marks: item.labMarks?.lab_mse_marks || null,
  //                                     lab_total: (item.labMarks?.record_marks || 0) + (item.labMarks?.continuous_evaluation_marks || 0) +
  //                                         (item.labMarks?.lab_mse_marks || 0),
  //                                     last_updated_at: item.updatedAt || new Date().toISOString()
  //                                 }

  //                                 allMarks.push(studentMark)
  //                             }
  //                         } catch (err) {
  //                             console.warn(`Could not load marks for student ${studentData.student.usn} in course ${course.course.code}:`, err)
  //                             // Create empty marks record for students without marks yet
  //                             const studentMark: StudentMark = {
  //                                 id: `${studentData.enrollmentId}-empty`,
  //                                 enrollmentId: studentData.enrollmentId,
  //                                 usn: studentData.student.usn,
  //                                 student_name: studentData.student.name,
  //                                 course_code: course.course.code,
  //                                 course_name: course.course.name,
  //                                 mse1_marks: null,
  //                                 mse2_marks: null,
  //                                 mse3_marks: null,
  //                                 task1_marks: null,
  //                                 task2_marks: null,
  //                                 task3_marks: null,
  //                                 theory_total: 0,
  //                                 record_marks: null,
  //                                 continuous_evaluation_marks: null,
  //                                 lab_mse_marks: null,
  //                                 lab_total: 0,
  //                                 last_updated_at: new Date().toISOString()
  //                             }
  //                             allMarks.push(studentMark)
  //                         }
  //                     }
  //                 } catch (err) {
  //                     console.error(`Error loading course ${course.course.code}:`, err)
  //                 }
  //             }

  //             setMarks(allMarks)
  //         } else {
  //             // Load marks for specific course
  //             const course = courses.find(c => c.offeringId === selectedCourse)
  //             if (!course) return

  //             const studentsResponse = await TeacherAPI.getCourseStudents(course.offeringId)
  //             const courseMarks: StudentMark[] = []

  //             for (const studentData of studentsResponse) {
  //                 try {
  //                     const marksResponse = await TeacherAPI.getStudentMarks(
  //                         course.course.id,
  //                         studentData.student.usn
  //                     )

  //                     if (marksResponse.status === 'success' && marksResponse.data.length > 0) {
  //                         const item = marksResponse.data[0]

  //                         const studentMark: StudentMark = {
  //                             id: item.id,
  //                             enrollmentId: item.enrollmentId,
  //                             usn: item.student?.usn || studentData.student.usn,
  //                             student_name: item.student?.user?.name || studentData.student.name,
  //                             course_code: item.course?.code || course.course.code,
  //                             course_name: item.course?.name || course.course.name,
  //                             mse1_marks: item.theoryMarks?.mse1_marks || null,
  //                             mse2_marks: item.theoryMarks?.mse2_marks || null,
  //                             mse3_marks: item.theoryMarks?.mse3_marks || null,
  //                             task1_marks: item.theoryMarks?.task1_marks || null,
  //                             task2_marks: item.theoryMarks?.task2_marks || null,
  //                             task3_marks: item.theoryMarks?.task3_marks || null,
  //                             theory_total: (item.theoryMarks?.mse1_marks || 0) + (item.theoryMarks?.mse2_marks || 0) +
  //                                 (item.theoryMarks?.mse3_marks || 0) + (item.theoryMarks?.task1_marks || 0) +
  //                                 (item.theoryMarks?.task2_marks || 0) + (item.theoryMarks?.task3_marks || 0),
  //                             record_marks: item.labMarks?.record_marks || null,
  //                             continuous_evaluation_marks: item.labMarks?.continuous_evaluation_marks || null,
  //                             lab_mse_marks: item.labMarks?.lab_mse_marks || null,
  //                             lab_total: (item.labMarks?.record_marks || 0) + (item.labMarks?.continuous_evaluation_marks || 0) +
  //                                 (item.labMarks?.lab_mse_marks || 0),
  //                             last_updated_at: item.updatedAt || new Date().toISOString()
  //                         }

  //                         courseMarks.push(studentMark)
  //                     }
  //                 } catch (err) {
  //                     console.warn(`Could not load marks for student ${studentData.student.usn}:`, err)
  //                     // Create empty marks record
  //                     const studentMark: StudentMark = {
  //                         id: `${studentData.enrollmentId}-empty`,
  //                         enrollmentId: studentData.enrollmentId,
  //                         usn: studentData.student.usn,
  //                         student_name: studentData.student.name,
  //                         course_code: course.course.code,
  //                         course_name: course.course.name,
  //                         mse1_marks: null,
  //                         mse2_marks: null,
  //                         mse3_marks: null,
  //                         task1_marks: null,
  //                         task2_marks: null,
  //                         task3_marks: null,
  //                         theory_total: 0,
  //                         record_marks: null,
  //                         continuous_evaluation_marks: null,
  //                         lab_mse_marks: null,
  //                         lab_total: 0,
  //                         last_updated_at: new Date().toISOString()
  //                     }
  //                     courseMarks.push(studentMark)
  //                 }
  //             }

  //             setMarks(courseMarks)
  //         }
  //     } catch (err) {
  //         setError('Failed to load marks data')
  //         console.error('Error loading marks:', err)
  //     } finally {
  //         setLoading(false)
  //     }
  // }
  //     const loadMarksData = async () => {
  //   setLoading(true)
  //   setError(null)

  //   try {
  //     const allMarks: StudentMark[] = []

  //     // Case 1: All courses
  //     if (selectedCourse === "all") {
  //       for (const course of courses) {
  //         try {
  //           // fetch structure for this course offering
  //           const structureResponse = await TeacherAPI.getCourseTestComponents(course.course.id, teacherid)
  //           const components = structureResponse.components || []
  //           setComponentsTest(components);
  //           // fetch students + their marks
  //           const marksResponse = await TeacherAPI.getCourseStudentMarks(
  //             course.offeringId,
  //             teacherid
  //           )

  //           if (marksResponse.status === "success" && marksResponse.students) {
  //             for (const student of marksResponse.students) {
  //               // initialize student marks with all components
  //               const studentMarks = components.map((c: ) => ({
  //                 componentId: c.id,
  //                 componentName: c.name,
  //                 type: c.type,
  //                 maxMarks: c.maxMarks,
  //                 weightage: c.weightage,
  //                 obtainedMarks: null
  //               }))

  //               // overlay actual marks from API
  //               student.marks.forEach((m: StudentMarkComponent) => {
  //                 const comp = studentMarks.find(c => c.componentId === m.componentId)
  //                 if (comp) comp.obtainedMarks = m.obtainedMarks
  //               })

  //               const studentMark: StudentMark = {
  //                 id: student.studentId,
  //                 enrollmentId: student.studentId, // or real enrollmentId if available
  //                 usn: student.usn,
  //                 student_name: student.studentName,
  //                 course_code: course.course.code,
  //                 course_name: course.course.name,
  //                 marks: studentMarks,
  //                 last_updated_at: new Date().toISOString()
  //               }

  //               allMarks.push(studentMark)
  //             }
  //           }
  //         } catch (err) {
  //           console.error(`Error loading course ${course.course.code}:`, err)
  //         }
  //       }

  //       setMarks(allMarks)
  //     } else {
  //       // Case 2: Specific course
  //       const course = courses.find(c => c.offeringId === selectedCourse)
  //       if (!course) return

  //       // fetch structure for this course offering
  //       const structureResponse = await TeacherAPI.getCourseTestComponents(course.course.id, teacherid)
  //       const components = structureResponse.components || []

  //       // fetch all students + marks
  //       const marksResponse = await TeacherAPI.getCourseStudentMarks(
  //         course.offeringId,
  //         teacherid
  //       )

  //       const courseMarks: StudentMark[] = []

  //       if (marksResponse.status === "success" && marksResponse.students) {
  //         for (const student of marksResponse.students) {
  //           // initialize all components for this student
  //           const studentMarks = components.map((c: any) => ({
  //             componentId: c.id,
  //             componentName: c.name,
  //             type: c.type,
  //             maxMarks: c.maxMarks,
  //             weightage: c.weightage,
  //             obtainedMarks: null
  //           }))

  //           // overlay actual marks
  //           student.marks.forEach((m: any) => {
  //             const comp = studentMarks.find(c => c.componentId === m.componentId)
  //             if (comp) comp.obtainedMarks = m.obtainedMarks
  //           })

  //           const studentMark: StudentMark = {
  //             id: student.studentId,
  //             enrollmentId: student.studentId,
  //             usn: student.usn,
  //             student_name: student.studentName,
  //             course_code: course.course.code,
  //             course_name: course.course.name,
  //             marks: studentMarks,
  //             last_updated_at: new Date().toISOString()
  //           }

  //           courseMarks.push(studentMark)
  //         }
  //       }

  //       setMarks(courseMarks)
  //     }
  //   } catch (err) {
  //     setError("Failed to load marks data")
  //     console.error("Error loading marks:", err)
  //   } finally {
  //     setLoading(false)
  //   }
  // }
  const loadMarksData = async () => {
    setLoading(true);
    setError(null);

    try {
      const allMarks: StudentMark[] = [];
      console.log("load marks data is run:", teacherId);
      if (selectedCourse === "all") {
        // Loop through all courses
        console.log("Loading marks for all courses:", courses);
        for (const course of courses) {
          try {
            // 1️⃣ Fetch the table structure (components)
            
            // 2️⃣ Fetch students + their marks
            const marksResponse = await TeacherAPI.getCourseStudentMarks(
              course.offeringId,
              teacherId
            );

            if (marksResponse.status === "success" && marksResponse.students) {
              for (const student of marksResponse.students) {
                // 3️⃣ Initialize student marks with all components
                console.log("Fetched components for course:", course.course.code, marksResponse.students);
                const studentMarks: StudentMarkComponent[] = componentsTest.map(
                  (c) => ({
                    componentId: c.id,
                    componentName: c.name,
                    type: c.type,
                    maxMarks: c.maxMarks,
                    weightage: c.weightage,
                    obtainedMarks: null,
                  })
                );

                // 4️⃣ Overlay actual marks from API
                student.marks.forEach((m: StudentMarkComponent) => {
                  const comp = studentMarks.find(
                    (c) => c.componentId === m.componentId
                  );
                  if (comp) comp.obtainedMarks = m.obtainedMarks;
                });

                // 5️⃣ Build student row
                const studentMark: StudentMark = {
                  id: student.studentId,
                  enrollmentId: student.studentId, // replace with real enrollmentId if available
                  usn: student.usn,
                  student_name: student.studentName,
                  course_code: course.course.code,
                  course_name: course.course.name,
                  marks: studentMarks,
                  last_updated_at: new Date().toISOString(),
                };

                allMarks.push(studentMark);
              }
            }
          } catch (err) {
            console.error(`Error loading course ${course.course.code}:`, err);
          }
        }

        setMarks(allMarks);
      } else {
        // Specific course
        console.log("Loading marks for specific course :", selectedCourse   );
        const course = courses.find((c) => c.offeringId === selectedCourse);
        if (!course) return;

        console.log("Found course:", course);
        // 2️⃣ Fetch students + marks
        const marksResponse = await TeacherAPI.getCourseStudentMarks(
          course.course.id,
          teacherId
        );
        const courseMarks: StudentMark[] = [];
        console.log("marks:",marksResponse.students);
        if (marksResponse.status === "success" && marksResponse.students) {
          for (const student of marksResponse.students) {
            // 3️⃣ Initialize all components
            const studentMarks: StudentMarkComponent[] = componentsTest.map(
              (c) => ({
                componentId: c.id,
                componentName: c.name,
                type: c.type,
                maxMarks: c.maxMarks,
                weightage: c.weightage,
                obtainedMarks: null,
              })
            );

            // 4️⃣ Overlay actual marks
            student.marks.forEach((m) => {
              const comp = studentMarks.find(
                (c) => c.componentId === m.componentId
              );
              if (comp) comp.obtainedMarks = m.obtainedMarks;
            });

            // 5️⃣ Build student row
            const studentMark: StudentMark = {
              id: student.studentId,
              enrollmentId: student.studentId,
              usn: student.usn,
              student_name: student.studentName,
              course_code: course.course.code,
              course_name: course.course.name,
              marks: studentMarks,
              last_updated_at: new Date().toISOString(),
            };

            courseMarks.push(studentMark);
          }
        }

        setMarks(courseMarks);
        console.log(
          "Loaded marks for course:",
          course.course.name,
          courseMarks
        );
      }
    } catch (err) {
      setError("Failed to load marks data");
      console.error("Error loading marks:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadAttendanceData = async () => {
    if (selectedCourse === "all") {
      setAttendanceRecords([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Load student attendance for the selected date and course
      const response = await TeacherAPI.getStudentAttendance(
        selectedCourse,
        selectedDate
      );

      if (response.status === "success") {
        const transformedAttendance: AttendanceRecord[] = response.data.map(
          (item: any) => ({
            id: item.attendanceRecordId || `temp-${item.studentId}`, // Use temp ID if no record exists yet
            date: selectedDate,
            studentId: item.studentId,
            usn: item.usn || "",
            student_name: item.student_name || "",
            status: item.status as "present" | "absent" | "unmarked",
            courseId: item.courseId,
            courseName: item.courseName,
          })
        );

        setAttendanceRecords(transformedAttendance);
      }
    } catch (err) {
      setError("Failed to load attendance data");
      console.error("Error loading attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle marks editing
  const handleMarkEdit = async (
    enrollmentId: string,
    field: string,
    value: string
  ) => {
    const numValue = value === "" ? null : parseInt(value);
    try {
      const response = await TeacherAPI.updateStudentMark(
        enrollmentId,
        field,
        numValue
      );
      if (response.status === "success") {
        // Update local state
        setMarks((prev) =>
          prev.map((mark) => {
            if (mark.enrollmentId === enrollmentId) {
              const updatedMark = { ...mark, [field]: numValue };

              // Handle MSE3 eligibility constraint
              if (field === "mse1_marks" || field === "mse2_marks") {
                const mse1 =
                  field === "mse1_marks" ? numValue : updatedMark.mse1_marks;
                const mse2 =
                  field === "mse2_marks" ? numValue : updatedMark.mse2_marks;

                // If MSE1 + MSE2 >= 20, clear MSE3
                if ((mse1 || 0) + (mse2 || 0) >= 20) {
                  updatedMark.mse3_marks = null;
                }
              }

              // Recalculate totals
              const theoryTotal = [
                updatedMark.mse1_marks,
                updatedMark.mse2_marks,
                updatedMark.mse3_marks,
                updatedMark.task1_marks,
                updatedMark.task2_marks,
                updatedMark.task3_marks,
              ].reduce((sum, val) => (sum || 0) + (val || 0), 0);

              const labTotal = [
                updatedMark.record_marks,
                updatedMark.continuous_evaluation_marks,
                updatedMark.lab_mse_marks,
              ].reduce((sum, val) => (sum || 0) + (val || 0), 0);

              updatedMark.theory_total = theoryTotal || 0;
              updatedMark.lab_total = labTotal || 0;
              updatedMark.last_updated_at = new Date().toISOString();
              return updatedMark;
            }
            return mark;
          })
        );
      }
    } catch (err) {
      console.error("Error updating mark:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update mark";
      setError(`Failed to update mark: ${errorMessage}`);
    }
    setEditingMarkId(null);
    setEditingMarkField(null);
  };

  // Handle attendance toggle
  const toggleAttendance = async (recordId: string) => {
    const record = attendanceRecords.find((r) => r.id === recordId);
    if (!record) return;

    if (selectedCourse === "all") {
      setError("Please select a specific course to mark attendance");
      return;
    }

    try {
      // Cycle through the three states: unmarked -> present -> absent -> unmarked
      let newStatus: "present" | "absent" | "unmarked";
      if (record.status === "unmarked") {
        newStatus = "present";
      } else if (record.status === "present") {
        newStatus = "absent";
      } else {
        newStatus = "unmarked";
      }

      const response = await TeacherAPI.updateStudentAttendance({
        studentId: record.studentId,
        courseId: selectedCourse,
        date: selectedDate,
        status: newStatus,
      });

      if (response.status === "success") {
        setAttendanceRecords((prev) =>
          prev.map((r) => (r.id === recordId ? { ...r, status: newStatus } : r))
        );
      }
    } catch (err) {
      console.error("Error updating attendance:", err);
      setError("Failed to update attendance");
    }
  };

  // Create attendance session for selected date and course
  // Export marks functionality
  // const exportMarks = () => {
  //     const csvContent = [
  //         ['USN', 'Name', 'Course', 'MSE1', 'MSE2', 'MSE3', 'Task1', 'Task2', 'Task3', 'Theory Total', 'Record', 'Continuous', 'Lab MSE', 'Lab Total'].join(','),
  //         ...marks.map(mark => [
  //             mark.usn,
  //             mark.student_name,
  //             `${mark.course_code} - ${mark.course_name}`,
  //             mark.mse1_marks || '',
  //             mark.mse2_marks || '',
  //             mark.mse3_marks || '',
  //             mark.task1_marks || '',
  //             mark.task2_marks || '',
  //             mark.task3_marks || '',
  //             mark.theory_total,
  //             mark.record_marks || '',
  //             mark.continuous_evaluation_marks || '',
  //             mark.lab_mse_marks || '',
  //             mark.lab_total
  //         ].join(','))
  //     ].join('\n')

  //     const blob = new Blob([csvContent], { type: 'text/csv' })
  //     const url = window.URL.createObjectURL(blob)
  //     const a = document.createElement('a')
  //     a.href = url
  //     a.download = `teacher_marks_${selectedCourse === 'all' ? 'all_courses' : selectedCourse}_${new Date().toISOString().split('T')[0]}.csv`
  //     a.click()
  //     window.URL.revokeObjectURL(url)
  // }
  const exportMarks = () => {
    if (!marks.length) return;

    // 1️⃣ Generate dynamic headers
    const headers = ["USN", "Name", "Course"];
    // Add component names dynamically (the first student's marks are used to get the headers)
    const componentNames = marks[0].marks.map((m) => m.componentName);
    headers.push(...componentNames);
    headers.push("Last Updated");

    // 2️⃣ Generate CSV rows
    const rows = marks.map((mark) => {
      const row = [
        mark.usn,
        mark.student_name,
        `${mark.course_code} - ${mark.course_name}`,
        ...mark.marks.map((m) => m.obtainedMarks ?? ""), // overlay actual marks
        mark.last_updated_at,
      ];
      return row.join(",");
    });

    // 3️⃣ Combine headers + rows
    const csvContent = [headers.join(","), ...rows].join("\n");

    // 4️⃣ Download CSV
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `teacher_marks_${
      selectedCourse === "all" ? "all_courses" : selectedCourse
    }_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Filter data based on search term
  const filteredMarks = marks.filter((mark) => {
    if (!searchTerm.trim()) return true;
    const search = searchTerm.toLowerCase();
    return (
      mark.usn.toLowerCase().includes(search) ||
      mark.student_name.toLowerCase().includes(search) ||
      mark.course_code.toLowerCase().includes(search) ||    
      mark.course_name.toLowerCase().includes(search)
    );
  });

  const filteredAttendanceRecords = attendanceRecords.filter((record) => {
    if (!searchTerm.trim()) return true;
    const search = searchTerm.toLowerCase();
    return (
      record.usn.toLowerCase().includes(search) ||
      record.student_name.toLowerCase().includes(search) ||
      (record.courseName && record.courseName.toLowerCase().includes(search))
    );
  });

  // Calculate attendance summary for selected date (using filtered data)
  const attendanceSummary = {
    present: filteredAttendanceRecords.filter((r) => r.status === "present")
      .length,
    absent: filteredAttendanceRecords.filter((r) => r.status === "absent")
      .length,
    unmarked: filteredAttendanceRecords.filter((r) => r.status === "unmarked")
      .length,
    total: filteredAttendanceRecords.length,
  };

  // Generate calendar for current month
  const generateCalendar = () => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();

    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${currentYear}-${String(currentMonth + 1).padStart(
        2,
        "0"
      )}-${String(day).padStart(2, "0")}`;
      const hasData = false; // We'll load this from API later
      const isSelected = date === selectedDate;

      days.push(
        <button
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`h-8 w-8 text-sm rounded ${
            isSelected
              ? "bg-emerald-600 text-white"
              : hasData
              ? "bg-green-100 text-green-800 hover:bg-green-200"
              : "hover:bg-gray-100"
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const navigateMonth = (direction: "prev" | "next") => {
    if (direction === "prev") {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const getMonthName = () => {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return monthNames[currentMonth];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Marks & Attendance Management
              </CardTitle>
              <CardDescription className="text-gray-800">
                View and edit student marks and attendance for your assigned
                courses
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={activeTab === "marks" ? "default" : "outline"}
                onClick={() => setActiveTab("marks")}
                className={
                  activeTab === "marks"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : ""
                }
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Marks
              </Button>
              <Button
                variant={activeTab === "attendance" ? "default" : "outline"}
                onClick={() => setActiveTab("attendance")}
                className={
                  activeTab === "attendance"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : ""
                }
              >
                <Calendar className="w-4 h-4 mr-2" />
                Attendance
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Course Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex gap-4 items-center">
              <label htmlFor="course-select" className="text-sm font-medium">
                Select Course:
              </label>
              <select
                id="course-select"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm min-w-[300px]"
              >
                <option value="all">All My Courses</option>
                {courses.map((course) => (
                  <option key={course.offeringId} value={course.offeringId}>
                    {course.course.code} - {course.course.name}
                    {course.section && ` (Section ${course.section.name})`}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-4 items-center">
              <label htmlFor="student-search" className="text-sm font-medium">
                Search Student:
              </label>
              <Input
                id="student-search"
                type="text"
                placeholder="Search by USN, name, or course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="min-w-[250px]"
              />
            </div>
            {activeTab === "marks" && (
              <Button onClick={exportMarks} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Marks
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              <span className="ml-2 text-gray-600">Loading...</span>
            </div>
          </CardContent>
        </Card>
      )}
      {!loading && activeTab === "marks" && componentsR ?(
        <Card>
          <CardHeader>
            <CardTitle>Student Marks</CardTitle>
            <CardDescription>
              Click on any mark to edit. Shows theory marks and lab marks for
              each course. Totals are automatically calculated.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Course
                    </th>
                    <th
                      className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                      colSpan={
                        componentsTest.filter((c) => c.type === "theory").length+2
                      }
                    >
                      Theory Marks
                    </th>
                    <th
                      className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                      colSpan={
                        componentsTest.filter((c) => c.type === "lab").length+2
                      }
                    >
                      Lab Marks
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Last Updated
                    </th>
                  </tr>
                  <tr>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      USN & Name
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code & Name
                    </th>

                    {/* Dynamic Theory Columns */}
                    {/* Inside table header */}
{componentsTest.filter(c => c.type === 'theory').map((comp, index) => (
  <th key={comp.id} className="border px-3 py-2">
    <div className="flex items-center gap-1">
      <input
        type="text"
        value={comp.name}
        className="border rounded px-1 py-0.5 text-xs"
        onChange={(e) => {
          const updated = [...componentsTest];
          updated[index].name = e.target.value;
          setComponentsTest(updated);
        }}
      />
      <button
        className="text-red-500 text-xs"
        onClick={() => {
          setComponentsTest((prev) => prev.filter((c) => c.id !== comp.id));
        }}
      >
        ×
      </button>
    </div>
  </th>
))}

{/* Add new column */}
<th className="border px-3 py-2">
  <button
    className="text-green-500 text-xs"
    onClick={() => {
      const newComp = {
        id: crypto.randomUUID(),
        name: "New Column",
        type: "theory",
        maxMarks: 20,
        weightage: 100,
      };
      setComponentsTest((prev) => [...prev, newComp]);
    }}
  >
    + Add
  </button>
</th>

                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Theory Total
                    </th>

                    {/* Dynamic Lab Columns */}
                    {/* Inside table header */}
{componentsTest.filter(c => c.type === 'lab').map((comp, index) => (
  <th key={comp.id} className="border px-3 py-2">
    <div className="flex items-center gap-1">
      <input
        type="text"
        value={comp.name}
        className="border rounded px-1 py-0.5 text-xs"
        onChange={(e) => {
          const updated = [...componentsTest];
          updated[index].name = e.target.value;
          setComponentsTest(updated);
        }}
      />
      <button
        className="text-red-500 text-xs"
        onClick={() => {
          setComponentsTest((prev) => prev.filter((c) => c.id !== comp.id));
        }}
      >
        ×
      </button>
    </div>
  </th>
))}

{/* Add new column */}
<th className="border px-3 py-2">
  <button
    className="text-green-500 text-xs"
    onClick={() => {
      const newComp = {
        id: crypto.randomUUID(),
        name: "New Column",
        type: "lab",
        maxMarks: 20,
        weightage: 100,
      };
      setComponentsTest((prev) => [...prev, newComp]);
    }}
  >
    + Add
  </button>
</th>

                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lab Total
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                  </tr>
                </thead>

<tbody className="bg-white">
  {marks.length === 0 ? (
    <tr>
      <td
        colSpan={componentsTest.length + 5}
        className="border border-gray-300 px-6 py-8 text-center"
      >
        <div className="text-gray-500">
          <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="font-medium">No marks data available</p>
          <p className="text-sm">
            Select a course to view and edit student marks
          </p>
        </div>
      </td>
    </tr>
  ) : (
    marks.map((mark) => {
      const theoryTotal = mark.marks
        .filter((m) => m.type === "theory")
        .reduce((sum, m) => sum + (m.obtainedMarks ?? 0), 0);

      const labTotal = mark.marks
        .filter((m) => m.type === "lab")
        .reduce((sum, m) => sum + (m.obtainedMarks ?? 0), 0);

      return (
        <tr key={mark.enrollmentId} className="hover:bg-gray-50">
          <td className="border border-gray-300 px-3 py-2">
            <div className="font-mono text-sm font-bold">{mark.usn}</div>
            <div className="text-sm text-gray-600">{mark.student_name}</div>
          </td>
          <td className="border border-gray-300 px-3 py-2">
            <div className="font-mono text-sm font-bold">{mark.course_code}</div>
            <div className="text-sm text-gray-600">{mark.course_name}</div>
          </td>

          {/* Render Theory Marks */}
          {componentsTest.filter((c) => c.type === "theory").map((comp) => {
            const studentMark = mark.marks.find((m) => m.componentId === comp.id);
            return (
              <td key={comp.id} className="border border-gray-300 px-3 py-2">
                {studentMark ? studentMark.obtainedMarks ?? "-" : "-"}
              </td>
            );
          })}

          <td className="border border-gray-300 px-3 py-2 font-bold text-emerald-600">
            {theoryTotal}
          </td>

          {/* Render Lab Marks */}
          {componentsTest.filter((c) => c.type === "lab").map((comp) => {
            const studentMark = mark.marks.find((m) => m.componentId === comp.id);
            return (
              <td key={comp.id} className="border border-gray-300 px-3 py-2">
                {studentMark ? studentMark.obtainedMarks ?? "-" : "-"}
              </td>
            );
          })}

          <td className="border border-gray-300 px-3 py-2 font-bold text-green-600">
            {labTotal}
          </td>

          <td className="border border-gray-300 px-3 py-2 text-xs text-gray-500">
            {new Date(mark.last_updated_at).toLocaleDateString()}
          </td>
        </tr>
      );
    })
  )}
</tbody>

              </table>
            </div>
          </CardContent>
        </Card>
      ):<Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              <span className="ml-2 text-gray-600">Loading...</span>
            </div>
          </CardContent>
        </Card>        
         }















      {!loading && activeTab === "attendance" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Attendance Calendar</CardTitle>
              <CardDescription>
                Click on a date to view/edit attendance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth("prev")}
                  className="p-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h3 className="font-medium text-lg">
                  {getMonthName()} {currentYear}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth("next")}
                  className="p-1"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-4">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="text-center text-xs font-medium text-gray-500 p-2"
                    >
                      {day}
                    </div>
                  )
                )}
              </div>
              <div className="grid grid-cols-7 gap-1">{generateCalendar()}</div>
              <div className="mt-4 text-xs text-gray-600">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 bg-green-100 rounded"></div>
                  <span>Has attendance data</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-600 rounded"></div>
                  <span>Selected date</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Attendance */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    Attendance for {new Date(selectedDate).toLocaleDateString()}
                  </CardTitle>
                  <CardDescription>
                    {attendanceRecords.length > 0 ? (
                      <>
                        {attendanceSummary.present} present,{" "}
                        {attendanceSummary.absent} absent
                        {attendanceSummary.unmarked > 0 &&
                          `, ${attendanceSummary.unmarked} unmarked`}
                      </>
                    ) : selectedCourse === "all" ? (
                      "Select a specific course to view attendance"
                    ) : (
                      "All students are unmarked for this date - click to mark attendance"
                    )}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        USN
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Student Name
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Status (Click to Toggle)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {filteredAttendanceRecords.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="border border-gray-300 px-6 py-8 text-center"
                        >
                          <div className="text-gray-500">
                            {searchTerm.trim() ? (
                              <div>
                                <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                <p className="font-medium">No students found</p>
                                <p className="text-sm">
                                  No students match "{searchTerm}". Try a
                                  different search term.
                                </p>
                              </div>
                            ) : selectedCourse === "all" ? (
                              <div>
                                <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                <p className="font-medium">
                                  Select a specific course to mark attendance
                                </p>
                                <p className="text-sm">
                                  Choose a course from the dropdown above to
                                  view and mark student attendance
                                </p>
                              </div>
                            ) : (
                              <div>
                                <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                <p className="font-medium">
                                  Loading attendance data...
                                </p>
                                <p className="text-sm">
                                  Attendance data will appear automatically when
                                  loaded
                                </p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredAttendanceRecords.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-3 py-2 font-mono text-sm">
                            {record.usn}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 font-medium">
                            {record.student_name}
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            <div className="text-sm">
                              <div className="font-medium">
                                {record.courseName || "No Course"}
                              </div>
                            </div>
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            <button
                              onClick={() => toggleAttendance(record.id)}
                              className={`inline-flex items-center px-3 py-2 rounded-full text-xs font-medium transition-colors duration-200 ${
                                record.status === "present"
                                  ? "bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer"
                                  : record.status === "absent"
                                  ? "bg-red-100 text-red-800 hover:bg-red-200 cursor-pointer"
                                  : "bg-gray-100 text-gray-800 hover:bg-gray-200 cursor-pointer"
                              } hover:scale-105`}
                              title={
                                record.status === "unmarked"
                                  ? "Click to mark as Present"
                                  : record.status === "present"
                                  ? "Click to mark as Absent"
                                  : "Click to mark as Unmarked"
                              }
                            >
                              {record.status === "present" ? (
                                <CheckCircle className="w-3 h-3 mr-1" />
                              ) : record.status === "absent" ? (
                                <XCircle className="w-3 h-3 mr-1" />
                              ) : (
                                <Clock className="w-3 h-3 mr-1" />
                              )}
                              {record.status === "unmarked"
                                ? "Unmarked"
                                : record.status === "present"
                                ? "Present"
                                : "Absent"}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
