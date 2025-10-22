'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calculator, AlertTriangle, CheckCircle, Edit3, Download, Loader2 } from 'lucide-react'
import { Course, Section } from './dropdown-navigation'
import { TeacherAPI, StudentMarks, TestComponent } from '@/lib/teacher-api'

interface TheoryMarksProps {
  courseOffering: Course
  selectedYear: string
  selectedDepartment: string
  selectedSection: Section
}

// Type for local editing state
interface MarksEditState {
  [testComponentId: string]: number | null;
}

export function TheoryMarksManagement({ courseOffering, selectedDepartment, selectedSection }: TheoryMarksProps) {
  const [students, setStudents] = useState<StudentMarks[]>([])
  const [testComponents, setTestComponents] = useState<TestComponent[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingStudent, setEditingStudent] = useState<string | null>(null)
  const [editState, setEditState] = useState<{ [enrollmentId: string]: MarksEditState }>({})

  // Load marks data and test components when course offering changes
  const loadMarksData = async () => {
    if (!courseOffering.offering_id) {
      setError('No course offering ID available')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      // Fetch test components first
      const components = await TeacherAPI.getTestComponents(courseOffering.offering_id)
      const theoryComponents = components.filter(c => c.type === 'theory')
      setTestComponents(theoryComponents)

      // Fetch student marks using new schema
      const marksData = await TeacherAPI.getStudentMarksNewSchema(courseOffering.course_id)
      setStudents(marksData)

      // Initialize edit state with current marks
      const initialEditState: { [enrollmentId: string]: MarksEditState } = {}
      marksData.forEach(student => {
        initialEditState[student.enrollmentId] = {}
        student.theoryMarks.forEach(mark => {
          initialEditState[student.enrollmentId][mark.testId] = mark.marksObtained
        })
      })
      setEditState(initialEditState)
    } catch (err) {
      console.error('Error loading marks data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load marks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMarksData()
  }, [courseOffering.offering_id, courseOffering.course_id])

  const updateMarks = (enrollmentId: string, testComponentId: string, value: number | null) => {
    setEditState(prev => ({
      ...prev,
      [enrollmentId]: {
        ...prev[enrollmentId],
        [testComponentId]: value
      }
    }))
  }

  const calculateTotal = (enrollmentId: string) => {
    const marks = editState[enrollmentId] || {}
    return testComponents.reduce((sum, component) => {
      const mark = marks[component.id] || 0
      return sum + mark
    }, 0)
  }

  const saveMarks = async (enrollmentId: string) => {
    setSaving(true)
    try {
      const studentData = students.find(s => s.enrollmentId === enrollmentId)
      if (!studentData) return

      // Prepare marks array for API
      const marksArray = testComponents.map(component => ({
        testComponentId: component.id,
        marksObtained: editState[enrollmentId]?.[component.id] || 0
      }))

      // Call the new marks update API
      await TeacherAPI.updateEnrollmentMarks(enrollmentId, marksArray)

      // Reload data to get fresh state
      await loadMarksData()

      setEditingStudent(null)
      alert(`Theory marks saved successfully for ${studentData.student.name}!`)
    } catch (error) {
      console.error('Error saving marks:', error)
      alert('Error saving marks. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const exportMarks = () => {
    // Export real data to CSV with dynamic columns
    const headers = ['USN', 'Name', ...testComponents.map(c => c.name), 'Total']
    const csvContent = [
      headers.join(','),
      ...students.map(student => {
        const marks = student.theoryMarks
        const total = calculateTotal(student.enrollmentId)
        return [
          student.student.usn,
          student.student.name,
          ...testComponents.map(component => {
            const mark = marks.find(m => m.testId === component.id)
            return mark?.marksObtained ?? ''
          }),
          total
        ].join(',')
      })
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${courseOffering.course_code}_theory_marks.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

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

  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Error Loading Marks</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center space-x-2 mb-1">
                <Calculator className="w-5 h-5 text-blue-600" />
                <span>Theory Marks Management</span>
              </CardTitle>
              <CardDescription className="text-sm">
                {courseOffering.course_code} - {courseOffering.course_name} • Section {selectedSection.section_name} • {selectedDepartment}
              </CardDescription>
            </div>
            <button
              onClick={exportMarks}
              className="flex items-center space-x-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded text-sm font-medium hover:bg-blue-200 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export Marks</span>
            </button>
          </div>
        </CardHeader>
      </Card>

      {/* Marks Entry Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Student Theory Marks</CardTitle>
          <CardDescription className="text-sm">
            {testComponents.length > 0
              ? `Click Edit to modify marks. Dynamic test components loaded: ${testComponents.map(c => c.name).join(', ')}`
              : 'No test components configured for this course. Admin needs to create test components first.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {testComponents.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No Test Components</h3>
              <p className="text-gray-600">
                An admin needs to configure test components for this course offering before you can enter marks.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-sm font-semibold text-gray-900">Student</th>
                    {testComponents.map(component => (
                      <th key={component.id} className="text-center py-2 px-3 text-sm font-semibold text-gray-900">
                        {component.name}
                        <br />
                        <span className="text-xs text-gray-500">(0-{component.maxMarks})</span>
                      </th>
                    ))}
                    <th className="text-center py-2 px-3 text-sm font-semibold text-gray-900">Total</th>
                    <th className="text-center py-2 px-3 text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => {
                    const total = calculateTotal(student.enrollmentId)
                    const isEditing = editingStudent === student.enrollmentId

                    return (
                      <tr
                        key={student.enrollmentId}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-3">
                          <div>
                            <span className="text-sm font-medium text-gray-900">{student.student.name}</span>
                            <br />
                            <span className="text-xs text-gray-500">{student.student.usn}</span>
                          </div>
                        </td>

                        {/* Dynamic test component columns */}
                        {testComponents.map(component => {
                          const currentMark = student.theoryMarks.find(m => m.testId === component.id)
                          const editValue = editState[student.enrollmentId]?.[component.id]

                          return (
                            <td key={component.id} className="py-3 px-3 text-center">
                              {isEditing ? (
                                <input
                                  type="number"
                                  min="0"
                                  max={component.maxMarks}
                                  value={editValue ?? ''}
                                  onChange={(e) => updateMarks(
                                    student.enrollmentId,
                                    component.id,
                                    e.target.value ? parseInt(e.target.value) : null
                                  )}
                                  className="w-16 px-2 py-1 text-center border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  title={`${component.name} (0-${component.maxMarks})`}
                                  placeholder="0"
                                  aria-label={component.name}
                                />
                              ) : (
                                <span className="text-sm">{currentMark?.marksObtained ?? '-'}</span>
                              )}
                            </td>
                          )
                        })}

                        {/* Total */}
                        <td className="py-3 px-3 text-center">
                          <span className={`text-sm font-semibold ${total >= (testComponents.reduce((sum, c) => sum + c.maxMarks, 0) * 0.8) ? 'text-green-600' :
                              total >= (testComponents.reduce((sum, c) => sum + c.maxMarks, 0) * 0.6) ? 'text-orange-600' :
                                'text-red-600'
                            }`}>
                            {total}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 text-center">
                          {isEditing ? (
                            <div className="flex items-center justify-center space-x-1">
                              <button
                                onClick={() => saveMarks(student.enrollmentId)}
                                disabled={saving}
                                className="p-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors disabled:opacity-50"
                                title="Save marks"
                                aria-label="Save marks"
                              >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={() => setEditingStudent(null)}
                                disabled={saving}
                                className="p-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                                title="Cancel editing"
                                aria-label="Cancel editing"
                              >
                                <AlertTriangle className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setEditingStudent(student.enrollmentId)}
                              className="p-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                              title="Edit marks"
                              aria-label="Edit marks"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help Information */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-blue-500 mt-0.5" />
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-1">Theory Marking Guidelines:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>This course uses <strong>dynamic test components</strong> configured by admins</li>
                <li>Current components: {testComponents.length > 0 ? testComponents.map(c => `${c.name} (max: ${c.maxMarks})`).join(', ') : 'None configured'}</li>
                <li>Click "Edit" to enter or modify marks for any student</li>
                <li>Marks are validated against max marks for each component</li>
                <li>Total is automatically calculated from all components</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
