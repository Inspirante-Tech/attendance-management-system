'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, CheckCircle, XCircle, Calendar } from 'lucide-react'
import mockDailyAttendance from '@/data/mockDailyAttendance.json'

interface DailyAttendanceProps {
  studentId: string
  selectedDate?: string | null
  selectedDateData?: {
    present: number
    absent: number
    total: number
    classes: Array<{
      course_name: string
      course_code: string
      status: 'present' | 'absent'
    }>
  } | null
  showDetailsCard?: boolean
}

interface AttendanceRecord {
  course_name: string
  course_code: string
  teacher_name: string
  status: 'present' | 'absent' | 'not_marked'
  hours: number
}
export function DailyAttendanceCheck({ 
  studentId, 
  selectedDate, 
  selectedDateData,
  showDetailsCard = true
}: DailyAttendanceProps) {  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(false)

  // Determine what data to display - selected date or today
  const isShowingSelectedDate = selectedDate && selectedDateData
  const displayData = isShowingSelectedDate ? 
    selectedDateData.classes.map(classInfo => ({
      course_name: classInfo.course_name,
      course_code: classInfo.course_code,
      teacher_name: '', // Selected date data doesn't have teacher names
      status: classInfo.status as 'present' | 'absent' | 'not_marked',      hours: 3 // Default hours since not available in calendar data
    })) : 
    attendanceData

  // Mock function to load today's attendance - replace with actual API call
  const loadTodayAttendance = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setAttendanceData(mockDailyAttendance as AttendanceRecord[])
    } catch (error) {
      console.error('Error loading attendance:', error)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    loadTodayAttendance()
  }, [studentId])
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
      case 'absent':
        return <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
      default:
        return <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'present':
        return 'Present'
      case 'absent':
        return 'Absent'
      default:
        return 'Not Marked'
    }
  }
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'absent':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Detailed Attendance Card */}
      {showDetailsCard && (        <Card className="h-full flex flex-col">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-sm sm:text-base">Class Details</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Individual class attendance for {isShowingSelectedDate ? 'selected date' : 'today'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 flex-1 overflow-y-auto">
            {loading && !isShowingSelectedDate ? (
              <div className="flex items-center justify-center py-6">
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                <span className="text-gray-600 text-xs sm:text-sm">Loading...</span>
              </div>            ) : (
              <div className="space-y-3">
                {displayData.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <Calendar className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-xs sm:text-sm">No classes scheduled</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto -mx-3 sm:mx-0">
                    <div className="inline-block min-w-full align-middle">                      <table className="min-w-full text-xs sm:text-sm">                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 sm:py-3 px-2 font-medium text-gray-700 lg:hidden">Course</th>
                          <th className="hidden lg:table-cell text-left py-2 sm:py-3 px-2 font-medium text-gray-700">Course Code</th>
                          <th className="hidden lg:table-cell text-left py-2 sm:py-3 px-2 font-medium text-gray-700">Course Name</th>
                          <th className="text-center py-2 sm:py-3 px-2 font-medium text-gray-700">Hours</th>
                          <th className="text-center py-2 sm:py-3 px-2 font-medium text-gray-700">Attended</th>
                          <th className="text-center py-2 sm:py-3 px-2 font-medium text-gray-700">Status</th>
                        </tr>
                      </thead><tbody>                        {displayData.map((record, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            {/* Combined course info for mobile/tablet */}
                            <td className="py-2 sm:py-3 px-2 lg:hidden">
                              <div className="min-w-[100px] sm:min-w-[120px]">
                                <div className="font-medium text-gray-900 text-xs sm:text-sm">{record.course_code}</div>
                                <div className="text-gray-600 text-xs truncate">{record.course_name}</div>
                              </div>
                            </td>
                            {/* Separate course code for desktop */}
                            <td className="hidden lg:table-cell py-2 sm:py-3 px-2">
                              <div className="font-medium text-gray-900 text-xs sm:text-sm">{record.course_code}</div>
                            </td>
                            {/* Separate course name for desktop */}
                            <td className="hidden lg:table-cell py-2 sm:py-3 px-2">
                              <div className="font-medium text-gray-900 text-xs sm:text-sm min-w-[160px]">{record.course_name}</div>
                            </td>
                            <td className="text-center py-2 sm:py-3 px-2">
                              <span className="font-medium text-xs sm:text-sm">{record.hours}</span>
                            </td>
                            <td className="text-center py-2 sm:py-3 px-2">
                              <span className="font-medium text-xs sm:text-sm">{record.status === 'present' ? record.hours : 0}</span>
                            </td>
                            <td className="text-center py-2 sm:py-3 px-2">
                              <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                                <div className="flex-shrink-0">
                                  {getStatusIcon(record.status)}
                                </div>
                                <span className={`px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-medium ${getStatusColor(record.status)}`}>
                                  {getStatusText(record.status)}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    </div>
                  </div>                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
