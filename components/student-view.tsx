"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Calendar, CheckCircle } from "lucide-react"
import { useSchedulerStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useEffect, useState } from "react"
import { useDebounce } from "@/hooks/use-debounce"
import { Progress } from "@/components/ui/progress"
import dayjs from "dayjs"

export function StudentView() {
  const {
    studentViewLoading,
    filteredStudents,
    studentListSearch,
    setStudentListSearch,
    getCurrentRotationForStudent,
    getNextRotationForStudent,
    getRotationName,
    getRotationColorClass,
    formatDate,
    viewFullSchedule,
    getCompletedRotationsForStudent,
    getCurrentDate,
  } = useSchedulerStore()

  const [searchInput, setSearchInput] = useState(studentListSearch)
  const debouncedSearch = useDebounce(searchInput, 300)
  const today = getCurrentDate()

  useEffect(() => {
    setStudentListSearch(debouncedSearch)
  }, [debouncedSearch, setStudentListSearch])

  return (
    <Card className="mb-6 border border-gray-100">
      <CardHeader className="pb-2">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle className="text-xl font-semibold text-primary-700 flex items-center">
            <BarChart className="h-6 w-6 mr-2" />
            Student Rotations
          </CardTitle>

          <div className="relative w-full md:w-64">
            <Input
              type="text"
              placeholder="Search students..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="search-input pr-8"
            />
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {studentViewLoading ? (
          <div className="flex justify-center items-center py-16">
            <LoadingSpinner message="Loading student data..." />
          </div>
        ) : (
          <div className="animate-in fade-in-50 duration-300">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="px-4 py-3 text-sm font-medium text-gray-600">Registration No.</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-600">Name</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-600">Batch</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-600">Current Rotation</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-600">Next Rotation</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-600">Completion</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => {
                      const currentRotation = getCurrentRotationForStudent(student.id)
                      const nextRotation = getNextRotationForStudent(student.id)
                      const completedRotations = getCompletedRotationsForStudent(student.id)
                      const completionPercentage = Math.round((completedRotations.length / 21) * 100)

                      // Check if current rotation is completed (end date has passed)
                      const isCurrentRotationCompleted =
                        currentRotation.rotation !== "None" && currentRotation.endDate
                          ? dayjs(currentRotation.endDate).isBefore(today)
                          : false

                      return (
                        <tr key={student.id} className="table-row-hover">
                          <td className="px-4 py-3 border-b border-gray-100">{student.regdNo}</td>
                          <td className="px-4 py-3 border-b border-gray-100">{student.name}</td>
                          <td className="px-4 py-3 border-b border-gray-100">
                            <span
                              className={`px-2 py-1 rounded-md text-xs font-medium inline-block ${
                                student.batch === "A"
                                  ? "bg-blue-100 text-blue-800"
                                  : student.batch === "B"
                                    ? "bg-green-100 text-green-800"
                                    : student.batch === "C"
                                      ? "bg-purple-100 text-purple-800"
                                      : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              Batch {student.batch}
                            </span>
                          </td>
                          <td className="px-4 py-3 border-b border-gray-100">
                            {currentRotation.rotation !== "None" ? (
                              <div className="flex items-center">
                                <div>
                                  <div
                                    className={`px-2 py-1 rounded-md text-xs font-medium inline-block mb-1 ${getRotationColorClass(currentRotation.rotation)}`}
                                  >
                                    {currentRotation.rotation}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {getRotationName(currentRotation.rotation)}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {formatDate(currentRotation.startDate)} - {formatDate(currentRotation.endDate)}
                                  </div>
                                </div>
                                {isCurrentRotationCompleted && (
                                  <CheckCircle className="ml-2 h-5 w-5 text-green-500 fill-green-500" />
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-500 italic">No current rotation</span>
                            )}
                          </td>
                          <td className="px-4 py-3 border-b border-gray-100">
                            {nextRotation ? (
                              <div>
                                <div
                                  className={`px-2 py-1 rounded-md text-xs font-medium inline-block mb-1 ${getRotationColorClass(nextRotation.rotation)}`}
                                >
                                  {nextRotation.rotation}
                                </div>
                                <div className="text-xs text-gray-500">{getRotationName(nextRotation.rotation)}</div>
                                <div className="text-xs text-gray-500">
                                  {formatDate(nextRotation.startDate)} - {formatDate(nextRotation.endDate)}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-500 italic">No upcoming rotations</span>
                            )}
                          </td>
                          <td className="px-4 py-3 border-b border-gray-100 w-32">
                            <div className="flex flex-col gap-1">
                              <Progress value={completionPercentage} className="h-2" />
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>{completedRotations.length} rotations</span>
                                <span>{completionPercentage}%</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 border-b border-gray-100">
                            <Button
                              onClick={() => viewFullSchedule(student.id)}
                              size="sm"
                              className="bg-primary-600 hover:bg-primary-700 flex items-center flash-hover-effect"
                            >
                              <Calendar className="h-4 w-4 mr-1" />
                              View Schedule
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
