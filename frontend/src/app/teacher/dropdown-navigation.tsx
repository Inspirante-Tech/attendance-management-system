'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  ChevronDown, 
  GraduationCap, 
  Building2, 
  BookOpen,
  Users
} from 'lucide-react'

// Types for the navigation data
interface Year {
  year: string
  academic_year: string
  semester: number
  total_students: number
  total_courses: number
}

interface Department {
  department_id: string
  department_name: string
  short_name: string
  total_students: number
  total_courses: number
  active_classes_today: number
}

export interface Course {
  course_id: string
  course_code: string
  course_name: string
  department_id: string
  total_students: number
  classes_completed: number
  total_classes: number
  attendance_percentage: number
}

export interface Section {
  section_id: string
  section_name: string
  department_id: string
  total_students: number
  present_today: number
  attendance_percentage: number
}

interface DropdownNavigationProps {
  selectedYear: string | null
  selectedDepartment: string | null
  selectedCourse: Course | null
  selectedSection: Section | null
  onYearSelect: (year: string) => void
  onDepartmentSelect: (department: string) => void
  onCourseSelect: (course: Course) => void
  onSectionSelect: (section: Section) => void
}

// Mock data - replace with actual API calls
const mockYearData: Year[] = [
  {
    year: '2nd Year',
    academic_year: '2024-25',
    semester: 4,
    total_students: 580,
    total_courses: 12
  },
  {
    year: '3rd Year', 
    academic_year: '2024-25',
    semester: 6,
    total_students: 550,
    total_courses: 15
  },
  {
    year: '4th Year',
    academic_year: '2024-25', 
    semester: 8,
    total_students: 520,
    total_courses: 8
  }
]

const mockDepartmentData: Department[] = [
  {
    department_id: 'CSE',
    department_name: 'Computer Science Engineering',
    short_name: 'CSE',
    total_students: 120,
    total_courses: 8,
    active_classes_today: 6
  },
  {
    department_id: 'AIDS',
    department_name: 'Artificial Intelligence and Data Science',
    short_name: 'AIDS',
    total_students: 80,
    total_courses: 6,
    active_classes_today: 4
  },
  {
    department_id: 'ISE',
    department_name: 'Information Science Engineering',
    short_name: 'ISE',
    total_students: 100,
    total_courses: 7,
    active_classes_today: 5
  },
  {
    department_id: 'ECE',
    department_name: 'Electronics and Communication',
    short_name: 'ECE',
    total_students: 90,
    total_courses: 6,
    active_classes_today: 4
  }
]

const mockCourseData: Record<string, Course[]> = {
  'CSE': [
    {
      course_id: '1',
      course_code: 'CS301',
      course_name: 'Data Structures and Algorithms',
      department_id: 'CSE',
      total_students: 60,
      classes_completed: 28,
      total_classes: 45,
      attendance_percentage: 85.2
    },
    {
      course_id: '2',
      course_code: 'CS302',
      course_name: 'Database Management Systems',
      department_id: 'CSE',
      total_students: 60,
      classes_completed: 25,
      total_classes: 40,
      attendance_percentage: 78.5
    },
    {
      course_id: '3',
      course_code: 'CS303',
      course_name: 'Computer Networks',
      department_id: 'CSE',
      total_students: 58,
      classes_completed: 22,
      total_classes: 38,
      attendance_percentage: 92.1
    }
  ],
  'ISE': [
    {
      course_id: '4',
      course_code: 'IS301',
      course_name: 'Software Engineering',
      department_id: 'ISE',
      total_students: 55,
      classes_completed: 30,
      total_classes: 42,
      attendance_percentage: 88.7
    },
    {
      course_id: '5',
      course_code: 'IS302',
      course_name: 'Web Technologies',
      department_id: 'ISE',
      total_students: 55,
      classes_completed: 26,
      total_classes: 40,
      attendance_percentage: 81.3
    }
  ]
}

const mockSectionData: Record<string, Section[]> = {
  'CSE': [
    {
      section_id: 'CSE-A',
      section_name: 'A',
      department_id: 'CSE',
      total_students: 60,
      present_today: 52,
      attendance_percentage: 86.7
    },
    {
      section_id: 'CSE-B', 
      section_name: 'B',
      department_id: 'CSE',
      total_students: 58,
      present_today: 48,
      attendance_percentage: 82.8
    },
    {
      section_id: 'CSE-C',
      section_name: 'C',
      department_id: 'CSE',
      total_students: 60,
      present_today: 45,
      attendance_percentage: 75.0
    }
  ],
  'ISE': [
    {
      section_id: 'ISE-A',
      section_name: 'A',
      department_id: 'ISE',
      total_students: 55,
      present_today: 49,
      attendance_percentage: 89.1
    },
    {
      section_id: 'ISE-B',
      section_name: 'B',
      department_id: 'ISE',
      total_students: 55,
      present_today: 44,
      attendance_percentage: 80.0
    }
  ],
  'AIDS': [
    {
      section_id: 'AIDS-A',
      section_name: 'A',
      department_id: 'AIDS',
      total_students: 40,
      present_today: 36,
      attendance_percentage: 90.0
    },
    {
      section_id: 'AIDS-B',
      section_name: 'B',
      department_id: 'AIDS',
      total_students: 40,
      present_today: 35,
      attendance_percentage: 87.5
    }
  ],
  'ECE': [
    {
      section_id: 'ECE-A',
      section_name: 'A',
      department_id: 'ECE',
      total_students: 45,
      present_today: 41,
      attendance_percentage: 91.1
    },
    {
      section_id: 'ECE-B',
      section_name: 'B',
      department_id: 'ECE',
      total_students: 45,
      present_today: 38,
      attendance_percentage: 84.4
    }
  ]
}

export function DropdownNavigation({
  selectedYear,
  selectedDepartment,
  selectedCourse,
  selectedSection,
  onYearSelect,
  onDepartmentSelect,
  onCourseSelect,
  onSectionSelect
}: DropdownNavigationProps) {
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false)
  const [deptDropdownOpen, setDeptDropdownOpen] = useState(false)
  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false)
  const [sectionDropdownOpen, setSectionDropdownOpen] = useState(false)
  
  const [years] = useState<Year[]>(mockYearData)
  const [departments] = useState<Department[]>(mockDepartmentData)
  const [courses, setCourses] = useState<Course[]>([])
  const [sections, setSections] = useState<Section[]>([])

  const yearRef = useRef<HTMLDivElement>(null)
  const deptRef = useRef<HTMLDivElement>(null)
  const courseRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (yearRef.current && !yearRef.current.contains(event.target as Node)) {
        setYearDropdownOpen(false)
      }
      if (deptRef.current && !deptRef.current.contains(event.target as Node)) {
        setDeptDropdownOpen(false)
      }
      if (courseRef.current && !courseRef.current.contains(event.target as Node)) {
        setCourseDropdownOpen(false)
      }
      if (sectionRef.current && !sectionRef.current.contains(event.target as Node)) {
        setSectionDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Load courses when department changes
  useEffect(() => {
    if (selectedDepartment) {
      const deptCourses = mockCourseData[selectedDepartment] || []
      setCourses(deptCourses)
    } else {
      setCourses([])
    }
  }, [selectedDepartment])

  // Load sections when department changes (sections depend on department, not course)
  useEffect(() => {
    if (selectedDepartment) {
      const deptSections = mockSectionData[selectedDepartment] || []
      setSections(deptSections)
    } else {
      setSections([])
    }
  }, [selectedDepartment])

  const handleYearSelect = (year: string) => {
    onYearSelect(year)
    setYearDropdownOpen(false)
  }

  const handleDepartmentSelect = (department: string) => {
    onDepartmentSelect(department)
    setDeptDropdownOpen(false)
  }

  const handleCourseSelect = (course: Course) => {
    onCourseSelect(course)
    setCourseDropdownOpen(false)
  }

  const handleSectionSelect = (section: Section) => {
    onSectionSelect(section)
    setSectionDropdownOpen(false)
  }

  return (
    <Card className="w-full relative z-50">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Year Dropdown */}
          <div ref={yearRef} className="relative flex-1">
            <Button
              variant={selectedYear ? "default" : "outline"}
              className={`w-full justify-between h-auto p-4 ${
                selectedYear ? 'bg-emerald-600 hover:bg-emerald-700' : ''
              }`}
              onClick={() => setYearDropdownOpen(!yearDropdownOpen)}
            >
              <div className="flex items-center space-x-3">
                <GraduationCap className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">
                    {selectedYear || 'Select Year'}
                  </div>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${
                yearDropdownOpen ? 'rotate-180' : ''
              }`} />
            </Button>

            {yearDropdownOpen && (
              <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-[60]">
                <div className="p-2">
                  {years.map((year) => (
                    <button
                      key={year.year}
                      className="w-full text-left p-3 rounded-md hover:bg-gray-50 transition-colors"
                      onClick={() => handleYearSelect(year.year)}
                    >
                      <div className="font-medium text-gray-900">{year.year}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Department Dropdown */}
          <div ref={deptRef} className="relative flex-1">
            <Button
              variant={selectedDepartment ? "default" : "outline"}
              className={`w-full justify-between h-auto p-4 ${
                selectedDepartment ? 'bg-emerald-600 hover:bg-emerald-700' : ''
              } ${!selectedYear ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => selectedYear && setDeptDropdownOpen(!deptDropdownOpen)}
              disabled={!selectedYear}
            >
              <div className="flex items-center space-x-3">
                <Building2 className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">
                    {selectedDepartment ? 
                      `${departments.find(d => d.department_id === selectedDepartment)?.short_name}: ${departments.find(d => d.department_id === selectedDepartment)?.department_name}` || selectedDepartment
                      : 'Select Department'
                    }
                  </div>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${
                deptDropdownOpen ? 'rotate-180' : ''
              }`} />
            </Button>

            {deptDropdownOpen && selectedYear && (
              <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-[60]">
                <div className="p-2">
                  {departments.map((dept) => (
                    <button
                      key={dept.department_id}
                      className="w-full text-left p-3 rounded-md hover:bg-gray-50 transition-colors"
                      onClick={() => handleDepartmentSelect(dept.department_id)}
                    >
                      <div className="font-medium text-gray-900">{dept.short_name}: {dept.department_name}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section Dropdown */}
          <div ref={sectionRef} className="relative flex-1">
            <Button
              variant={selectedSection ? "default" : "outline"}
              className={`w-full justify-between h-auto p-4 ${
                selectedSection ? 'bg-emerald-600 hover:bg-emerald-700' : ''
              } ${!selectedDepartment ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => selectedDepartment && setSectionDropdownOpen(!sectionDropdownOpen)}
              disabled={!selectedDepartment}
            >
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">
                    {selectedSection ? `Section ${selectedSection.section_name}` : 'Select Section'}
                  </div>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${
                sectionDropdownOpen ? 'rotate-180' : ''
              }`} />
            </Button>

            {sectionDropdownOpen && selectedDepartment && (
              <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-[60]">
                <div className="p-2 max-h-60 overflow-y-auto">
                  {sections.length > 0 ? sections.map((section) => (
                    <button
                      key={section.section_id}
                      className="w-full text-left p-3 rounded-md hover:bg-gray-50 transition-colors"
                      onClick={() => handleSectionSelect(section)}
                    >
                      <div className="font-medium text-gray-900">Section {section.section_name}</div>
                    </button>
                  )) : (
                    <div className="p-3 text-center text-gray-500 text-sm">
                      No sections available for this department
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Course Dropdown */}
          <div ref={courseRef} className="relative flex-1">
            <Button
              variant={selectedCourse ? "default" : "outline"}
              className={`w-full justify-between h-auto p-4 ${
                selectedCourse ? 'bg-emerald-600 hover:bg-emerald-700' : ''
              } ${!selectedDepartment ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => selectedDepartment && setCourseDropdownOpen(!courseDropdownOpen)}
              disabled={!selectedDepartment}
            >
              <div className="flex items-center space-x-3">
                <BookOpen className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">
                    {selectedCourse ? `${selectedCourse.course_code}: ${selectedCourse.course_name}` : 'Select Course'}
                  </div>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${
                courseDropdownOpen ? 'rotate-180' : ''
              }`} />
            </Button>

            {courseDropdownOpen && selectedDepartment && (
              <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-[60]">
                <div className="p-2 max-h-60 overflow-y-auto">
                  {courses.length > 0 ? courses.map((course) => (
                    <button
                      key={course.course_id}
                      className="w-full text-left p-3 rounded-md hover:bg-gray-50 transition-colors"
                      onClick={() => handleCourseSelect(course)}
                    >
                      <div className="font-medium text-gray-900">{course.course_code}: {course.course_name}</div>
                    </button>
                  )) : (
                    <div className="p-3 text-center text-gray-500 text-sm">
                      No courses available
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
