"use client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FileText, Search, X } from "lucide-react"
import { useSchedulerStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"

export function StudentView() {
  const {
    studentViewLoading,
    studentListSearch,
    setStudentListSearch,
    filteredStudents,
    getCurrentRotationForStudent,
    getNextRotationForStudent,
    getRotationColorClass,
    formatDate,
    viewFullSchedule,
  } = useSchedulerStore()

  return (
    <Card className="mb-6 border border-gray-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold text-primary-700 flex items-center">
          <BarChart className="h-6 w-6 mr-2" />
          Schedule Visualization
        </CardTitle>
      </CardHeader>

      <CardContent>
        {studentViewLoading ? (
          <div className="flex justify-center items-center py-16">
            <LoadingSpinner message="Loading student data..." />
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in-50 duration-300">
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>

              <Input
                type="text"
                value={studentListSearch}
                onChange={(e) => setStudentListSearch(e.target.value)}
                placeholder="Search by name or registration number"
                className="w-full pl-10 pr-10 py-3"
              />

              {studentListSearch.length > 0 && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full text-gray-400 hover:text-gray-600"
                    onClick={() => setStudentListSearch("")}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="px-4 py-3 text-sm font-medium text-gray-600">Reg. No.</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-600">Student</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-600">Batch</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-600">Current Rotation</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-600">Start Date</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-600">End Date</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-600">Next Rotation</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => {
                      const currentRotation = getCurrentRotationForStudent(student.id)
                      const nextRotation = getNextRotationForStudent(student.id)

                      return (
                        <tr key={student.id} className="table-row-hover">
                          <td className="px-4 py-3 font-medium border-b border-gray-100">{student.regdNo}</td>
                          <td className="px-4 py-3 border-b border-gray-100">{student.name}</td>
                          <td className="px-4 py-3 border-b border-gray-100">
                            <span className="px-2 py-1 bg-gray-100 rounded-md text-xs font-medium">
                              {student.batch}
                            </span>
                          </td>
                          <td className="px-4 py-3 border-b border-gray-100">
                            <div
                              className={`px-2 py-1 rounded-md text-xs font-medium badge ${getRotationColorClass(currentRotation.rotation)}`}
                            >
                              {currentRotation.rotation}
                            </div>
                          </td>
                          <td className="px-4 py-3 border-b border-gray-100">
                            {formatDate(currentRotation.startDate)}
                          </td>
                          <td className="px-4 py-3 border-b border-gray-100">{formatDate(currentRotation.endDate)}</td>
                          <td className="px-4 py-3 border-b border-gray-100">
                            {nextRotation ? (
                              <div
                                className={`px-2 py-1 rounded-md text-xs font-medium badge ${getRotationColorClass(nextRotation.rotation)}`}
                              >
                                {nextRotation.rotation}
                              </div>
                            ) : (
                              <span className="text-gray-500">None</span>
                            )}
                          </td>
                          <td className="px-4 py-3 border-b border-gray-100">
                            <Button
                              onClick={() => viewFullSchedule(student.id)}
                              size="sm"
                              className="bg-primary-600 hover:bg-primary-700 flex items-center"
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              View Full Schedule
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
