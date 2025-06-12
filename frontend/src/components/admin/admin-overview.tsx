'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Users, 
  GraduationCap
} from 'lucide-react'

// No props interface needed for this component

// Mock students and teachers data with courses
const mockStudents = [
  { id: '1', name: 'Aditya Sharma', usn: 'NNM22CS001', department: 'CSE', year: '2nd Year', section: 'A', courses: ['CS201', 'CS202', 'MA201'] },
  { id: '2', name: 'Bhavana Nair', usn: 'NNM22AIDS002', department: 'AIDS', year: '2nd Year', section: 'A', courses: ['AIDS201', 'CS201', 'MA201'] },
  { id: '3', name: 'Chetan Kumar', usn: 'NNM22ISE003', department: 'ISE', year: '3rd Year', section: 'B', courses: ['IS301', 'CS301', 'MA301'] },
  { id: '4', name: 'Divya Rao', usn: 'NNM22ECE004', department: 'ECE', year: '3rd Year', section: 'A', courses: ['EC301', 'EC302', 'CS301'] },
  { id: '5', name: 'Rahul Verma', usn: 'NNM22ME005', department: 'ME', year: '4th Year', section: 'B', courses: ['ME401', 'ME402', 'CS401'] },
  { id: '6', name: 'Priya Singh', usn: 'NNM22CE006', department: 'CE', year: '4th Year', section: 'A', courses: ['CE401', 'CE402', 'MA401'] },
  { id: '7', name: 'Rajesh Nair', usn: 'NNM22CS009', department: 'CSE', year: '2nd Year', section: 'B', courses: ['CS201', 'CS202', 'PH201'] },
  { id: '8', name: 'Sneha Patel', usn: 'NNM21AIDS010', department: 'AIDS', year: '3rd Year', section: 'A', courses: ['AIDS301', 'CS301', 'ST301'] },
  { id: '9', name: 'Vikram Joshi', usn: 'NNM20ISE011', department: 'ISE', year: '4th Year', section: 'B', courses: ['IS401', 'IS402', 'CS401'] },
]

const mockTeachers = [
  { id: '1', name: 'Dr. Rajesh Kumar', employeeId: 'EMP001', department: 'CSE', years: ['2nd Year', '3rd Year'], courses: ['CS201', 'CS301'] },
  { id: '2', name: 'Prof. Meera Patel', employeeId: 'EMP002', department: 'AIDS', years: ['2nd Year'], courses: ['AIDS201'] },
  { id: '3', name: 'Dr. Suresh Nair', employeeId: 'EMP003', department: 'ISE', years: ['3rd Year', '4th Year'], courses: ['IS301', 'IS401'] },
  { id: '4', name: 'Prof. Kavitha Reddy', employeeId: 'EMP004', department: 'ECE', years: ['3rd Year'], courses: ['EC301', 'EC302'] },
  { id: '5', name: 'Dr. Anand Sharma', employeeId: 'EMP005', department: 'ME', years: ['4th Year'], courses: ['ME401', 'ME402'] },
]

export function AdminOverview() {
  const [loading] = useState(false)
  
  // Show all students and teachers without filtering
  const filteredStudents = mockStudents
  const filteredTeachers = mockTeachers

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }  return (
    <div className="space-y-6">      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle>Students</CardTitle>
          <CardDescription>
            {filteredStudents.length} students enrolled
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{student.name}</p>
                      <p className="text-xs text-gray-600">{student.usn}</p>
                    </div>
                  </div>                  <div className="text-right">
                    <p className="text-sm font-medium">{student.department}</p>
                    <p className="text-xs text-gray-600">{student.year} • Section {student.section}</p>
                  </div>
                </div>
              ))            ) : (
              <p className="text-center text-gray-500 py-4">No students found</p>
            )}
          </div>
        </CardContent>
      </Card>      {/* Teachers List */}
      <Card>
        <CardHeader>
          <CardTitle>Teachers</CardTitle>
          <CardDescription>
            {filteredTeachers.length} teachers assigned
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredTeachers.length > 0 ? (
              filteredTeachers.map((teacher) => (
                <div key={teacher.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <GraduationCap className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{teacher.name}</p>
                      <p className="text-xs text-gray-600">{teacher.employeeId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{teacher.department}</p>
                    <p className="text-xs text-gray-600">Years: {teacher.years.join(', ')}</p>
                  </div>
                </div>
              ))            ) : (
              <p className="text-center text-gray-500 py-4">No teachers found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
