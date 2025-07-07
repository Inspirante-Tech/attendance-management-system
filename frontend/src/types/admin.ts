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
