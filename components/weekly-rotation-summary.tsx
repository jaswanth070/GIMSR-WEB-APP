"use client"

import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import { useSchedulerStore } from "@/lib/store"

export function WeeklyRotationSummary() {
  const {
    getFilteredStudents,
    getStudentRotationForWeek,
    currentViewStartDate,
    getRotationColorClass,
    getRotationName,
    viewFullSchedule,
  } = useSchedulerStore()

  const students = getFilteredStudents()

  return (
    <div>
      <h3 className="text-lg font-semibold text-primary-700 mb-4 flex items-center">
        <FileText className="h-5 w-5 mr-2" />
        Weekly Rotation Summary
      </h3>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Reg. No.</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Student</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Batch</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Rotation</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Sub-Phase</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const rotation = getStudentRotationForWeek(student.id, currentViewStartDate)

                return (
                  <tr key={student.id} className="table-row-hover">
                    <td className="px-4 py-3 font-medium border-b border-gray-100">{student.regdNo}</td>
                    <td className="px-4 py-3 border-b border-gray-100">{student.name}</td>
                    <td className="px-4 py-3 border-b border-gray-100">
                      <span className="px-2 py-1 bg-gray-100 rounded-md text-xs font-medium">{student.batch}</span>
                    </td>
                    <td className="px-4 py-3 border-b border-gray-100">
                      {rotation && (
                        <div
                          className={`px-2 py-1 rounded-md text-xs font-medium badge ${getRotationColorClass(rotation.rotation)}`}
                        >
                          {rotation.rotation}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 border-b border-gray-100">
                      {rotation && getRotationName(rotation.rotation)}
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
  )
}
