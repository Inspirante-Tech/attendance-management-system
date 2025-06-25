'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Users, 
  AlertTriangle, 
  TrendingDown,
  Calendar,
  BarChart3,
  Download
} from 'lucide-react'

import { Course, Section } from './dropdown-navigation'

interface AttendanceAnalyticsProps {
  courseOffering: Course
  selectedYear: string
  selectedDepartment: string
  selectedSection: Section
}

interface StudentAnalytics {
  student_id: string
  usn: string
  name: string
  total_classes: number
  attended_classes: number
  attendance_percentage: number
  department: string
  phone?: string
  email?: string
}

// Mock analytics data - replace with actual API call
const mockAnalyticsData: StudentAnalytics[] = [
  {
    student_id: '1',
    usn: 'NNM22CS001',
    name: 'Aditya Sharma',
    total_classes: 45,
    attended_classes: 43,
    attendance_percentage: 95.6,
    department: 'Computer Science',
    phone: '+91 9876543210',
    email: 'aditya.sharma@student.nmamit.in'
  },
  {
    student_id: '2',
    usn: 'NNM22AIDS002',
    name: 'Bhavana Nair',
    total_classes: 45,
    attended_classes: 38,
    attendance_percentage: 84.4,
    department: 'AI & Data Science',
    phone: '+91 9876543211',
    email: 'bhavana.nair@student.nmamit.in'
  },
  {
    student_id: '3',
    usn: 'NNM22ISE003',
    name: 'Chetan Kumar',
    total_classes: 45,
    attended_classes: 32,
    attendance_percentage: 71.1,
    department: 'Information Science',
    phone: '+91 9876543212',
    email: 'chetan.kumar@student.nmamit.in'
  },
  {
    student_id: '4',
    usn: 'NNM22ECE004',
    name: 'Divya Rao',
    total_classes: 45,
    attended_classes: 41,
    attendance_percentage: 91.1,
    department: 'Electronics & Communication',
    phone: '+91 9876543213',
    email: 'divya.rao@student.nmamit.in'
  },
  {
    student_id: '5',
    usn: 'NNM22ME005',
    name: 'Rahul Verma',
    total_classes: 45,
    attended_classes: 30,
    attendance_percentage: 66.7,
    department: 'Mechanical Engineering',
    phone: '+91 9876543214',
    email: 'rahul.verma@student.nmamit.in'
  },
  {
    student_id: '6',
    usn: 'NNM22CE006',
    name: 'Priya Singh',
    total_classes: 45,
    attended_classes: 33,
    attendance_percentage: 73.3,
    department: 'Civil Engineering',
    phone: '+91 9876543215',
    email: 'priya.singh@student.nmamit.in'
  },
  {
    student_id: '7',
    usn: 'NNM22CS007',
    name: 'Arjun Menon',
    total_classes: 45,
    attended_classes: 44,
    attendance_percentage: 97.8,
    department: 'Computer Science',
    phone: '+91 9876543216',
    email: 'arjun.menon@student.nmamit.in'
  },
  {
    student_id: '8',
    usn: 'NNM22AIDS008',
    name: 'Sneha Reddy',
    total_classes: 45,
    attended_classes: 36,
    attendance_percentage: 80.0,
    department: 'AI & Data Science',
    phone: '+91 9876543217',
    email: 'sneha.reddy@student.nmamit.in'
  }
]

export function AttendanceAnalytics({
  courseOffering,
  selectedYear,
  selectedDepartment,
  selectedSection
}: AttendanceAnalyticsProps) {
  const [selectedThreshold, setSelectedThreshold] = useState<75 | 85>(85)

  // Filter students based on attendance threshold
  const lowAttendanceStudents = mockAnalyticsData.filter(
    student => student.attendance_percentage < selectedThreshold
  )

  const criticalStudents = mockAnalyticsData.filter(
    student => student.attendance_percentage < 75
  )

  const warningStudents = mockAnalyticsData.filter(
    student => student.attendance_percentage >= 75 && student.attendance_percentage < 85
  )

  const exportData = () => {
    // Mock export functionality
    const csvContent = [
      ['USN', 'Name', 'Department', 'Total Classes', 'Attended', 'Attendance %', 'Phone', 'Email'].join(','),
      ...lowAttendanceStudents.map(student => [
        student.usn,
        student.name,
        student.department,
        student.total_classes,
        student.attended_classes,
        student.attendance_percentage.toFixed(1),
        student.phone || '',
        student.email || ''
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${courseOffering.course_code}_low_attendance_report.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center space-x-2 mb-1">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
                <span>Attendance Analytics</span>
              </CardTitle>
              <CardDescription className="text-sm">
                {courseOffering.course_code} - {courseOffering.course_name} • Section {selectedSection.section_name} • {selectedDepartment}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{selectedYear}</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{mockAnalyticsData.length}</p>
                <p className="text-sm text-gray-600">Total Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-red-600">{criticalStudents.length}</p>
                <p className="text-sm text-gray-600">Below 75%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center space-x-3">
              <TrendingDown className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold text-orange-600">{warningStudents.length}</p>
                <p className="text-sm text-gray-600">75% - 85%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {mockAnalyticsData.length - criticalStudents.length - warningStudents.length}
                </p>
                <p className="text-sm text-gray-600">Above 85%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Export */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Show students below:</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedThreshold(75)}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    selectedThreshold === 75
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  75%
                </button>
                <button
                  onClick={() => setSelectedThreshold(85)}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    selectedThreshold === 85
                      ? 'bg-orange-100 text-orange-700 border border-orange-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  85%
                </button>
              </div>
            </div>
            
            <button
              onClick={exportData}
              className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded text-sm font-medium hover:bg-emerald-200 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Low Attendance Students */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            Students with Attendance Below {selectedThreshold}%
          </CardTitle>
          <CardDescription className="text-sm">
            {lowAttendanceStudents.length} students need attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          {lowAttendanceStudents.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-green-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Great Job!</h3>
              <p className="text-gray-500">
                All students have attendance above {selectedThreshold}%
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-4 text-base font-semibold text-gray-900">Student</th>
                    <th className="text-left py-2 px-4 text-base font-semibold text-gray-900">USN</th>
                    <th className="text-left py-2 px-4 text-base font-semibold text-gray-900">Department</th>
                    <th className="text-center py-2 px-4 text-base font-semibold text-gray-900">Attendance</th>
                    <th className="text-left py-2 px-4 text-base font-semibold text-gray-900">Phone</th>
                    <th className="text-left py-2 px-4 text-base font-semibold text-gray-900">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {lowAttendanceStudents.map((student) => (
                    <tr 
                      key={student.student_id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <span className="text-base font-medium text-gray-900">{student.name}</span>
                      </td>
                      <td className="py-3 px-4 text-base text-gray-900">{student.usn}</td>
                      <td className="py-3 px-4 text-base text-gray-600">{student.department}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-base font-semibold ${
                          student.attendance_percentage < 75 
                            ? 'text-red-600' 
                            : student.attendance_percentage < 85 
                            ? 'text-orange-600' 
                            : 'text-green-600'
                        }`}>
                          {student.attendance_percentage.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-base text-gray-700">{student.phone || '-'}</td>
                      <td className="py-3 px-4 text-base text-gray-700">{student.email || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
