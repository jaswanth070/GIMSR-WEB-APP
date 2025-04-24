"use client"
import { Button } from "@/components/ui/button"
import { Eye, Download } from "lucide-react"
import { useSchedulerStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Search } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export function RotationView() {
  const {
    rotationViewLoading,
    getAllRotations,
    getRotationColorClass,
    getStudentsInRotation,
    formatDate,
    viewStudentsInRotation,
    exportRotationDataToCSV,
  } = useSchedulerStore()

  const [searchQuery, setSearchQuery] = useState("")

  const allRotations = getAllRotations()

  const filteredRotations = allRotations.filter(
    (rotation) =>
      rotation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rotation.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rotation.phase.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <Card className="mb-6 border border-gray-100">
      <CardHeader className="pb-2">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle className="text-xl font-semibold text-primary-700 flex items-center">
            <BarChart className="h-6 w-6 mr-2" />
            Rotations Overview
          </CardTitle>

          <div className="relative w-full md:w-64">
            <Input
              type="text"
              placeholder="Search rotations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input pr-8"
            />
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {rotationViewLoading ? (
          <div className="flex justify-center items-center py-16">
            <LoadingSpinner message="Loading rotation data..." />
          </div>
        ) : (
          <div className="animate-in fade-in-50 duration-300">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="px-4 py-3 text-sm font-medium text-gray-600">Rotation</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-600">Phase</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-600">Current Students</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-600">Start Date</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-600">End Date</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRotations.map((rotation) => {
                      const students = getStudentsInRotation(rotation.code)

                      return (
                        <tr key={rotation.id} className="table-row-hover">
                          <td className="px-4 py-3 border-b border-gray-100">
                            <div className="flex items-center">
                              <div
                                className={`px-2 py-1 rounded-md text-xs font-medium inline-block badge ${getRotationColorClass(rotation.code)}`}
                              >
                                {rotation.code}
                              </div>
                              <span className="ml-2">{rotation.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 border-b border-gray-100">{rotation.phase}</td>
                          <td className="px-4 py-3 border-b border-gray-100">
                            {rotation.studentCount > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {students.slice(0, 3).map((student) => (
                                  <span key={student.id} className="bg-gray-100 px-2 py-1 rounded-md text-xs tooltip">
                                    {student.regdNo}
                                    <span className="tooltip-text">{student.name}</span>
                                  </span>
                                ))}
                                {students.length > 3 && (
                                  <span className="bg-gray-100 px-2 py-1 rounded-md text-xs">
                                    +{students.length - 3} more
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-500 italic">No students currently assigned</span>
                            )}
                          </td>
                          <td className="px-4 py-3 border-b border-gray-100">{formatDate(rotation.startDate)}</td>
                          <td className="px-4 py-3 border-b border-gray-100">{formatDate(rotation.endDate)}</td>
                          <td className="px-4 py-3 border-b border-gray-100">
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => viewStudentsInRotation(rotation.code)}
                                size="sm"
                                className="bg-primary-600 hover:bg-primary-700 flex items-center flash-hover-effect"
                                disabled={rotation.studentCount === 0}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>

                              <Button
                                onClick={() => exportRotationDataToCSV(rotation.code)}
                                size="sm"
                                variant="outline"
                                className="border-primary-600 text-primary-600 hover:bg-primary-50 flex items-center flash-hover-effect"
                                disabled={rotation.studentCount === 0}
                                title={`Export ${rotation.name} data`}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
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
