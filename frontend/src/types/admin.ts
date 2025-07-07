// Admin API types

export interface UserRole {
  id: string
  role: 'student' | 'teacher' | 'admin'
  userId: string
}

export interface College {
  id: string
  name: string
  code: string
}

export interface Department {
  id: string
  name: string
  code: string
}

export interface Section {
  id: string
  section_name: string
}

export interface StudentEnrollment {
  id: string
  courseId: string
  course?: {
    course_code: string
    course_name: string
  }
}

export interface ApiUser {
  id: string
  username: string
  name: string
  email?: string
  phone?: string
  createdAt: string
  userRoles?: UserRole[]
  student?: {
    id: string
    usn?: string
    semester?: number
    batchYear?: number
    collegeId: string
    departmentId?: string
    sectionId?: string
    colleges?: College
    departments?: Department
    sections?: Section
    enrollments: StudentEnrollment[]
  }
  teacher?: {
    id: string
    employeeId?: string
    collegeId: string
    departmentId?: string
    colleges?: College
    departments?: Department
  }
  admin?: {
    id: string
    collegeId?: string
    colleges?: College
  }
}

export interface ApiResponse<T> {
  status: 'success' | 'error'
  data: T
  error?: string
  message?: string
  count?: number
}

// Marks and Attendance interfaces
export interface StudentMark {
  id: string
  enrollmentId: string
  student: {
    id: string
    usn: string
    user: {
      name: string
    }
  }
  course: {
    id: string
    code: string
    name: string
  }
  // Theory marks
  theoryMarks?: {
    id: string
    mse1_marks?: number | null
    mse2_marks?: number | null
    mse3_marks?: number | null
    task1_marks?: number | null
    task2_marks?: number | null
    task3_marks?: number | null
    last_updated_at?: string
  }
  // Lab marks
  labMarks?: {
    id: string
    record_marks?: number | null
    continuous_evaluation_marks?: number | null
    lab_mse_marks?: number | null
    last_updated_at?: string
  }
  updatedAt: string
}

export interface TheoryMarks {
  id: string
  enrollmentId: string
  mse1_marks?: number | null
  mse2_marks?: number | null
  mse3_marks?: number | null
  task1_marks?: number | null
  task2_marks?: number | null
  task3_marks?: number | null
  last_updated_at?: string
}

export interface LabMarks {
  id: string
  enrollmentId: string
  record_marks?: number | null
  continuous_evaluation_marks?: number | null
  lab_mse_marks?: number | null
  last_updated_at?: string
}

export interface AttendanceRecord {
  id: string
  date: string
  studentId: string
  courseOfferingId: string
  status: 'present' | 'absent'
  student: {
    id: string
    usn: string
    user: {
      name: string
    }
  }
  courseOffering: {
    id: string
    course: {
      id: string
      code: string
      name: string
    }
  }
}

export interface AttendanceCalendarDay {
  date: string
  hasData: boolean
  presentCount: number
  absentCount: number
  totalCount: number
}

// Course Enrollment interfaces
export interface EligibleStudent {
  id: string
  usn: string
  name: string
  semester: number
  batchYear: number
  department: {
    id: string
    name: string
    code: string
  } | null
  section: {
    id: string
    name: string
  } | null
}

export interface CourseEnrollmentData {
  course: {
    id: string
    code: string
    name: string
    type: string
    department: {
      id: string
      name: string
      code: string
    } | null
    restrictions: {
      departmentId: string
      departmentName: string
      departmentCode: string
    }[]
  }
  eligibleStudents: EligibleStudent[]
  count: number
}

export interface EnrollmentResult {
  courseOffering: {
    id: string
    courseId: string
    year: string
    semester: string
    teacherId: string | null
  }
  enrollmentsCreated: number
  totalRequested: number
  errors: string[]
}

export interface CourseEnrollment {
  id: string
  attemptNumber: number
  student: {
    id: string
    usn: string
    name: string
    semester: number
    batchYear: number
    department: {
      name: string
      code: string
    } | null
    section: {
      name: string
    } | null
  } | null
  course: {
    id: string
    code: string
    name: string
    type: string
  } | null
  teacher: {
    id: string
    name: string
  } | null
  academicYear: string | null
  semester: number | null
}
