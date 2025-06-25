'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { AttendanceMarking } from './attendance-marking'
import { AttendanceAnalytics } from './attendance-analytics'
import { 
  Users, 
  BarChart3
} from 'lucide-react'

import { Course, Section } from './dropdown-navigation'

interface CourseManagementProps {
  courseOffering: Course
  selectedYear: string
  selectedDepartment: string
  selectedSection: Section
}

export function CourseManagement({
  courseOffering,
  selectedYear,
  selectedDepartment,
  selectedSection
}: CourseManagementProps) {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="attendance">
        <TabsList>
          <TabsTrigger value="attendance">
            <Users className="w-5 h-5 mr-2" />
            <span className="text-base">Mark Attendance</span>
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="w-5 h-5 mr-2" />
            <span className="text-base">Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attendance">
          <AttendanceMarking
            courseOffering={courseOffering}
            selectedYear={selectedYear}
            selectedDepartment={selectedDepartment}
            selectedSection={selectedSection}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <AttendanceAnalytics
            courseOffering={courseOffering}
            selectedYear={selectedYear}
            selectedDepartment={selectedDepartment}
            selectedSection={selectedSection}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
