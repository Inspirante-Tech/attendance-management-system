'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Users, Award } from "lucide-react";
import AttendanceAnalytics from './AttendanceAnalytics';
import MarksAnalytics from '@/app/analytics/MarksAnalytics';
import ExportReports from '@/app/analytics/ExportReports';
//import { AttendanceStats } from '@/app/student/attendance-stats'

export default function AnalyticsPage() {
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('2024-25');

  const academicYears = ['2024-25', '2023-24', '2022-23', '2021-22'];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-6 space-y-3 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Comprehensive attendance and academic performance reports</p>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
            <span className="text-xs sm:text-sm text-gray-600">Last updated: {new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* Filters and Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
          {/* Report Filters - Left Side */}
          <div>
            <Card className="h-full">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-base sm:text-lg">Report Filters</CardTitle>
                <CardDescription className="text-sm">Select criteria to generate reports</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="space-y-1 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-700">Academic Year</label>
                  <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
                    <SelectTrigger className="h-9 sm:h-10">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {academicYears.map(year => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-700">Actions</label>
                  <ExportReports 
                    filters={{
                      academicYear: selectedAcademicYear
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Overview Statistics - Right Side */}
          <div>
            <Card className="h-full">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-base sm:text-lg">Overview Statistics</CardTitle>
                <CardDescription className="text-sm">Key metrics for Academic Year {selectedAcademicYear}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 text-center">
                  <div className="sm:col-span-1">
                    <div className="text-lg sm:text-xl font-bold text-blue-600">490</div>
                    <div className="text-xs sm:text-sm text-gray-700">Students</div>
                  </div>
                  <div className="sm:col-span-1">
                    <div className="text-lg sm:text-xl font-bold text-green-600">42</div>
                    <div className="text-xs sm:text-sm text-gray-700">Courses</div>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <div className="text-lg sm:text-xl font-bold text-indigo-600">87.3%</div>
                    <div className="text-xs sm:text-sm text-gray-700">Attendance</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:gap-4 text-center">
                  <div>
                    <div className="text-lg sm:text-xl font-bold text-purple-600">76.8%</div>
                    <div className="text-xs sm:text-sm text-gray-700">Avg Marks</div>
                  </div>
                  <div>
                    <div className="text-lg sm:text-xl font-bold text-emerald-600">92.1%</div>
                    <div className="text-xs sm:text-sm text-gray-700">Pass Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="attendance" className="space-y-3 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-2 h-9 sm:h-10">
          <TabsTrigger value="attendance" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
            <Users className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Attendance Analytics</span>
            <span className="sm:hidden">Attendance</span>
          </TabsTrigger>
          <TabsTrigger value="marks" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
            <Award className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Marks & Performance Analytics</span>
            <span className="sm:hidden">Marks</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="space-y-3 sm:space-y-6">
          <AttendanceAnalytics 
            academicYear={selectedAcademicYear}
          />
        </TabsContent>

        <TabsContent value="marks" className="space-y-3 sm:space-y-6">
          <MarksAnalytics 
            academicYear={selectedAcademicYear}
          />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
