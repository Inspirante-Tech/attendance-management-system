// filepath: e:\GitHub\Inspirante\frontend\src\components\teacher\attendance-marking.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Users, 
  UserCheck, 
  UserX,
  Save
} from 'lucide-react'

import { Course, Section } from './dropdown-navigation'
import mockAttendanceStudentsImport from '@/data/mockAttendanceStudents.json'
import mockOpenElectiveStudentsImport from '@/data/mockOpenElectiveStudents.json'

interface AttendanceMarkingProps {
  courseOffering: Course
  selectedYear: string
  selectedDepartment: string
  selectedSection: Section
}

interface Student {
  student_id: string
  usn: string
  name: string
  attendance_status: 'present' | 'absent'
  photo_url?: string
}

// Type the imported data
const mockAttendanceStudents: Student[] = mockAttendanceStudentsImport as Student[]
const mockOpenElectiveStudents: Student[] = mockOpenElectiveStudentsImport as Student[]

export function AttendanceMarking({
  courseOffering,
  selectedYear,
  selectedDepartment,
  selectedSection
}: AttendanceMarkingProps) {  const [students, setStudents] = useState<Student[]>(mockAttendanceStudents)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [topicCovered, setTopicCovered] = useState('')
  const [hoursTaken, setHoursTaken] = useState('')

  // Load student data when course offering changes
  const loadStudentData = async () => {
    setLoading(true)
    try {
      // Replace with actual API call
      // const data = await fetchCourseStudents(courseOffering.offering_id, teacherId)
      // setStudents(data)
      
      // For open electives, load students from multiple departments
      if (courseOffering.course_code.startsWith('OE')) {
        // Mock data for open elective students from mixed departments
        setStudents(mockOpenElectiveStudents)
      } else {
        // Regular departmental course students
        setStudents(mockAttendanceStudents)
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error('Error loading student data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStudentData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseOffering.course_id, courseOffering.course_code])

  const markAttendance = (studentId: string, status: 'present' | 'absent') => {
    setStudents(prev => prev.map(student => 
      student.student_id === studentId 
        ? { ...student, attendance_status: status }
        : student
    ))
  }
  const markAllPresent = () => {
    setStudents(prev => prev.map(student => ({
      ...student,
      attendance_status: 'present' as const
    })))
  }

  const saveAttendance = async () => {
    // Validate required fields
    if (!topicCovered.trim()) {
      alert('Please enter the topic covered for this class.')
      return
    }
    
    if (!hoursTaken.trim() || parseFloat(hoursTaken) < 1) {
      alert('Please enter valid hours taken for this class (minimum 1 hour).')
      return
    }

    setSaving(true)
    try {
      // Replace with actual API call
      // First create attendance record
      // const attendanceRecord = await createAttendance({
      //   offering_id: courseOffering.course_id,
      //   teacher_id: teacherId,
      //   class_date: currentDate.toISOString().split('T')[0],
      //   period_number: 1, // Get from actual period selection
      //   syllabus_covered: topicCovered,
      //   hours_taken: parseFloat(hoursTaken),
      //   status: 'held'
      // })
      
      // Then create attendance records for each student
      // await Promise.all(students.map(student => 
      //   createAttendanceRecord({
      //     attendance_id: attendanceRecord.attendance_id,
      //     student_id: student.student_id,
      //     status: student.attendance_status === 'not_marked' ? 'absent' : student.attendance_status
      //   })
      // ))
      
      console.log('Saving attendance with:', {
        topic: topicCovered,
        hours: hoursTaken,
        students: students.map(s => ({ id: s.student_id, name: s.name, status: s.attendance_status }))
      })
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      alert(`Attendance saved successfully!\nTopic: ${topicCovered}\nHours: ${hoursTaken}`)
    } catch (error) {
      console.error('Error saving attendance:', error)
      alert('Error saving attendance. Please try again.')
    } finally {
      setSaving(false)
    }
  }
  const presentCount = students.filter(s => s.attendance_status === 'present').length
  const absentCount = students.filter(s => s.attendance_status === 'absent').length
  const attendancePercentage = students.length > 0 ? (presentCount / students.length) * 100 : 0

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">      {/* Header Card */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">
                {courseOffering.course_code} - {courseOffering.course_name}
              </CardTitle>
              <CardDescription className="text-base">
                Section {selectedSection.section_name} • {selectedDepartment} • {selectedYear}
              </CardDescription>
            </div>
            <div className="flex items-center justify-between space-x-8">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-500" />
                <div className="text-center">
                  <p className="font-medium text-lg">{students.length}</p>
                  <p className="text-sm text-gray-600">Total Students</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-green-500" />
                <div className="text-center">
                  <p className="font-medium text-green-600 text-lg">{presentCount}</p>
                  <p className="text-sm text-gray-600">Present</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <UserX className="w-5 h-5 text-red-500" />
                <div className="text-center">
                  <p className="font-medium text-red-600 text-lg">{absentCount}</p>
                  <p className="text-sm text-gray-600">Absent</p>
                </div>
              </div>
              <button
                onClick={markAllPresent}
                className="px-4 py-2 bg-green-100 text-green-700 rounded text-base font-medium hover:bg-green-200 transition-colors ml-4"
              >
                Reset All to Present
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 pb-3">
          {/* Attendance Percentage */}
          <div>
            <div className="flex justify-between text-base text-gray-600 mb-1">
              <span>Class Attendance</span>
              <span>{attendancePercentage.toFixed(1)}%</span>
            </div>            <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
              <div 
                className={`h-1 rounded-full bg-emerald-500 transition-all duration-300 ${
                  attendancePercentage >= 90 ? 'w-full' :
                  attendancePercentage >= 80 ? 'w-4/5' :
                  attendancePercentage >= 70 ? 'w-3/4' :
                  attendancePercentage >= 60 ? 'w-3/5' :
                  attendancePercentage >= 50 ? 'w-1/2' :
                  attendancePercentage >= 40 ? 'w-2/5' :
                  attendancePercentage >= 30 ? 'w-1/3' :
                  attendancePercentage >= 20 ? 'w-1/5' :
                  attendancePercentage >= 10 ? 'w-1/12' : 'w-0'
                }`}
              />            </div>          </div>
        </CardContent>
      </Card>

      {/* Topic and Hours Input */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Class Details</CardTitle>
          <CardDescription className="text-base">Enter the topic covered and hours taken for this class</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="topicCovered" className="block text-base font-medium text-gray-700 mb-1">
                Topic Covered
              </label>
              <textarea
                id="topicCovered"
                value={topicCovered}
                onChange={(e) => setTopicCovered(e.target.value)}
                placeholder="Enter the topic(s) covered in this class..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                rows={3}
              />
            </div>
            <div>
              <label htmlFor="hoursTaken" className="block text-base font-medium text-gray-700 mb-1">
                Hours Taken
              </label>
              <input
                id="hoursTaken"
                type="number"
                value={hoursTaken}
                onChange={(e) => setHoursTaken(e.target.value)}
                placeholder="Enter hours"
                min="1"
                max="8"
                step="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Student Attendance</CardTitle>
          <CardDescription className="text-base">Mark attendance for each student</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-lg font-medium">USN</th>
                  <th className="text-left py-3 px-4 text-lg font-medium">Name</th>
                  <th className="text-center py-3 px-4 text-lg font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr 
                    key={student.student_id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-base">{student.usn}</td>
                    <td className="py-3 px-4 text-base font-medium">{student.name}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => markAttendance(student.student_id, student.attendance_status === 'present' ? 'absent' : 'present')}
                        className={`px-4 py-2 rounded text-base font-medium transition-colors ${
                          student.attendance_status === 'present'
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                      >
                        {student.attendance_status === 'present' ? 'Present' : 'Absent'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Card>
        <CardContent className="py-4">
          <button
            onClick={saveAttendance}
            disabled={saving || !topicCovered.trim() || !hoursTaken.trim()}
            className="w-full py-3 px-4 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>
              {saving ? 'Saving Attendance...' : 'Save Attendance'}
            </span>
          </button>
        </CardContent>
      </Card>
    </div>
  )
}
