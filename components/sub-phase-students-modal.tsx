"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, FileText, Search } from "lucide-react"
import { useSchedulerStore } from "@/lib/store"

export function SubPhaseStudentsModal() {
  const {
    selectedRotation,
    subPhaseStudentSearch,
    setSubPhaseStudentSearch,
    getFilteredSubPhaseStudents,
    formatDate,
    viewFullSchedule,
    closeSubPhaseStudentsModal,
  } = useSchedulerStore()

  const students = getFilteredSubPhaseStudents()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-40 overflow-auto p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in-50 zoom-in-95 duration-300">
        <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-primary-700 to-primary-800 text-white">
          <h2 className="text-xl font-bold flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span>{`Students in ${selectedRotation} Rotation`}</span>
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeSubPhaseStudentsModal}
            className="text-white hover:text-gray-200 hover:bg-white/10 rounded-full"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="p-6 overflow-auto flex-grow">
          <div className="mb-4 relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>

            <Input
              type="text"
              value={subPhaseStudentSearch}
              onChange={(e) => setSubPhaseStudentSearch(e.target.value)}
              placeholder="Search by name or registration number"
              className="w-full pl-10 pr-10 py-3"
            />

            {subPhaseStudentSearch.length > 0 && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full text-gray-400 hover:text-gray-600"
                  onClick={() => setSubPhaseStudentSearch("")}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-4 py-3 text-sm font-medium text-gray-600">Reg. No.</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-600">Name</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-600">Batch</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-600">Start Date</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-600">End Date</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="table-row-hover">
                      <td className="px-4 py-3 font-medium border-b border-gray-100">{student.regdNo}</td>
                      <td className="px-4 py-3 border-b border-gray-100">{student.name}</td>
                      <td className="px-4 py-3 border-b border-gray-100">
                        <span className="px-2 py-1 bg-gray-100 rounded-md text-xs font-medium">{student.batch}</span>
                      </td>
                      <td className="px-4 py-3 border-b border-gray-100">{formatDate(student.startDate)}</td>
                      <td className="px-4 py-3 border-b border-gray-100">{formatDate(student.endDate)}</td>
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end bg-gray-50">
          <Button variant="outline" onClick={closeSubPhaseStudentsModal}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
