"use client"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { useSchedulerStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"

export function BatchView() {
  const {
    batchViewLoading,
    getCurrentPhaseForBatch,
    getNextPhaseForBatch,
    getStudentCountInBatch,
    formatDate,
    viewBatchStudents,
  } = useSchedulerStore()

  const batches = ["A", "B", "C", "D"]

  return (
    <Card className="mb-6 border border-gray-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold text-primary-700 flex items-center">
          <BarChart className="h-6 w-6 mr-2" />
          Schedule Visualization
        </CardTitle>
      </CardHeader>

      <CardContent>
        {batchViewLoading ? (
          <div className="flex justify-center items-center py-16">
            <LoadingSpinner message="Loading batch data..." />
          </div>
        ) : (
          <div className="animate-in fade-in-50 duration-300">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="px-4 py-3 text-sm font-medium text-gray-600">Batch</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-600">Current Phase</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-600">Students</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-600">Start Date</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-600">End Date</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-600">Next Phase</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batches.map((batch) => {
                      const currentPhase = getCurrentPhaseForBatch(batch)
                      const nextPhase = getNextPhaseForBatch(batch)

                      return (
                        <tr key={batch} className="table-row-hover">
                          <td className="px-4 py-3 font-medium border-b border-gray-100">
                            <div className="flex items-center">
                              <span
                                className={`w-3 h-3 rounded-full mr-2 ${
                                  batch === "A"
                                    ? "bg-blue-500"
                                    : batch === "B"
                                      ? "bg-green-500"
                                      : batch === "C"
                                        ? "bg-purple-500"
                                        : "bg-yellow-500"
                                }`}
                              ></span>
                              <span>{`Batch ${batch}`}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 border-b border-gray-100">{currentPhase.phase}</td>
                          <td className="px-4 py-3 border-b border-gray-100">
                            <span className="px-2 py-1 bg-primary-100 text-primary-800 rounded-md text-xs font-medium">
                              {getStudentCountInBatch(batch)}
                            </span>
                          </td>
                          <td className="px-4 py-3 border-b border-gray-100">{formatDate(currentPhase.startDate)}</td>
                          <td className="px-4 py-3 border-b border-gray-100">{formatDate(currentPhase.endDate)}</td>
                          <td className="px-4 py-3 border-b border-gray-100">{nextPhase ? nextPhase.phase : "None"}</td>
                          <td className="px-4 py-3 border-b border-gray-100">
                            <Button
                              onClick={() => viewBatchStudents(batch)}
                              size="sm"
                              className="bg-primary-600 hover:bg-primary-700 flex items-center"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Students
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
