// filepath: e:\GitHub\Inspirante\frontend\src\components\admin\course-management.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  BookOpen,
  Building2
} from 'lucide-react'

interface CourseManagementProps {
  selectedYear: string
}

interface Course {
  id: string
  courseCode: string
  courseName: string
  department: string
  semester: number
  credits: number
  type: 'core' | 'elective' | 'open_elective'
  teacherId?: string
  teacherName?: string
  createdAt: string
}

// Mock data
const mockCourses: Course[] = [
  {
    id: '1',
    courseCode: 'CS301',
    courseName: 'Data Structures and Algorithms',
    department: 'CSE',
    semester: 3,
    credits: 4,
    type: 'core',
    teacherId: 't1',
    teacherName: 'Dr. Priya Kumar',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    courseCode: 'CS302',
    courseName: 'Database Management Systems',
    department: 'CSE',
    semester: 4,
    credits: 4,
    type: 'core',
    teacherId: 't2',
    teacherName: 'Prof. Rajesh Sharma',
    createdAt: '2024-01-16'
  },
  {
    id: '3',
    courseCode: 'OE101',
    courseName: 'Machine Learning Fundamentals',
    department: 'Open Elective',
    semester: 5,
    credits: 3,
    type: 'open_elective',
    teacherId: 't3',
    teacherName: 'Dr. Anita Desai',
    createdAt: '2024-02-01'
  }
]

export function CourseManagement({ selectedYear }: CourseManagementProps) {
  const [courses, setCourses] = useState<Course[]>(mockCourses)
  const [filteredCourses, setFilteredCourses] = useState<Course[]>(mockCourses)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [showAddForm, setShowAddForm] = useState(false) // eslint-disable-line @typescript-eslint/no-unused-vars
  const [editingCourse, setEditingCourse] = useState<Course | null>(null) // eslint-disable-line @typescript-eslint/no-unused-vars

  // Filter courses
  const filterCourses = () => {
    let filtered = courses

    if (searchTerm) {
      filtered = filtered.filter(course => 
        course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.courseName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(course => course.department === selectedDepartment)
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(course => course.type === selectedType)
    }

    setFilteredCourses(filtered)
  }

  // Delete course
  const deleteCourse = (courseId: string) => {
    if (confirm('Are you sure you want to delete this course? This will affect all enrolled students.')) {
      setCourses(prev => prev.filter(course => course.id !== courseId))
    }
  }

  // Get type badge color
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'core': return 'bg-blue-100 text-blue-800'
      case 'elective': return 'bg-green-100 text-green-800'
      case 'open_elective': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Course Management</CardTitle>
              <CardDescription>
                Manage courses, subjects, and curriculum for {selectedYear}
              </CardDescription>
            </div>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Course
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="search">Search Courses</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Search by course code or name..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    filterCourses()
                  }}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              aria-label="Filter by department"
              value={selectedDepartment}
              onChange={(e) => {
                setSelectedDepartment(e.target.value)
                filterCourses()
              }}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="all">All Departments</option>
              <option value="CSE">Computer Science</option>
              <option value="ECE">Electronics</option>
              <option value="ME">Mechanical</option>
              <option value="CE">Civil</option>
              <option value="AIDS">AI & Data Science</option>
              <option value="ISE">Information Science</option>
              <option value="Open Elective">Open Elective</option>
            </select>
            <select
              aria-label="Filter by course type"
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value)
                filterCourses()
              }}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="all">All Types</option>
              <option value="core">Core Courses</option>
              <option value="elective">Department Electives</option>
              <option value="open_elective">Open Electives</option>
            </select>
            <div className="text-sm text-gray-600 flex items-center">
              Total: {filteredCourses.length} courses
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses List */}
      <div className="space-y-4">
        {filteredCourses.map((course) => (
          <Card key={course.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <BookOpen className="w-5 h-5 text-blue-500" />
                  <div>
                    <CardTitle className="text-lg">
                      {course.courseCode} - {course.courseName}
                    </CardTitle>                    <CardDescription>
                      {course.department} • Semester {course.semester}
                      {course.teacherName && ` • ${course.teacherName}`}
                    </CardDescription>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(course.type)}`}>
                    {course.type.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingCourse(course)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteCourse(course.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{courses.filter(c => c.type === 'core').length}</p>
                <p className="text-xs text-gray-600">Core Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{courses.filter(c => c.type === 'elective').length}</p>
                <p className="text-xs text-gray-600">Electives</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{courses.filter(c => c.type === 'open_elective').length}</p>
                <p className="text-xs text-gray-600">Open Electives</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
