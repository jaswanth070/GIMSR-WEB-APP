"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronDown, Filter, RotateCcw, Check, Search, CalendarIcon } from "lucide-react"
import { useSchedulerStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { StudentSearchResults } from "@/components/student-search-results"
import { Card, CardContent } from "@/components/ui/card"

export function FilterPanel() {
  const {
    filters,
    showFilters,
    toggleFilters,
    studentSearchQuery,
    setStudentSearchQuery,
    studentSearchResults,
    studentSearchLoading,
    selectStudent,
    jumpToDate,
    setJumpToDate,
    jumpToSelectedDate,
    applyFilters,
    resetFilters,
  } = useSchedulerStore()

  return (
    <Card className="mb-6 border-none shadow-lg">
      <CardContent className="p-0">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-t-xl p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Global Filters
            </h2>
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFilters}
                className="text-white hover:text-white hover:bg-primary-500"
              >
                <ChevronDown className={cn("h-6 w-6", !showFilters && "rotate-180")} />
              </Button>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="p-6 space-y-6 animate-in fade-in-50 slide-in-from-top-5 duration-300 bg-white rounded-b-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <span className="bg-blue-100 text-blue-800 p-1 rounded-md mr-2">
                    <CalendarIcon className="h-4 w-4" />
                  </span>
                  Batch
                </label>
                <Select
                  value={filters.batch}
                  onValueChange={(value) => useSchedulerStore.setState({ filters: { ...filters, batch: value } })}
                >
                  <SelectTrigger className="w-full border-2 hover:border-primary-300 transition-colors">
                    <SelectValue placeholder="Select batch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Batches</SelectItem>
                    <SelectItem value="A">Batch A</SelectItem>
                    <SelectItem value="B">Batch B</SelectItem>
                    <SelectItem value="C">Batch C</SelectItem>
                    <SelectItem value="D">Batch D</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <span className="bg-green-100 text-green-800 p-1 rounded-md mr-2">
                    <CalendarIcon className="h-4 w-4" />
                  </span>
                  Phase
                </label>
                <Select
                  value={filters.phase}
                  onValueChange={(value) => useSchedulerStore.setState({ filters: { ...filters, phase: value } })}
                >
                  <SelectTrigger className="w-full border-2 hover:border-primary-300 transition-colors">
                    <SelectValue placeholder="Select phase" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Phases</SelectItem>
                    <SelectItem value="MED">Medicine</SelectItem>
                    <SelectItem value="SUR">Surgery</SelectItem>
                    <SelectItem value="OBG">OBGY</SelectItem>
                    <SelectItem value="OTH">Others</SelectItem>
                    <SelectItem value="COM">Community Medicine</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <span className="bg-purple-100 text-purple-800 p-1 rounded-md mr-2">
                    <CalendarIcon className="h-4 w-4" />
                  </span>
                  Date Range
                </label>
                <div className="flex space-x-2">
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) =>
                      useSchedulerStore.setState({
                        filters: { ...filters, startDate: e.target.value },
                      })
                    }
                    className="border-2 hover:border-primary-300 transition-colors"
                  />
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) =>
                      useSchedulerStore.setState({
                        filters: { ...filters, endDate: e.target.value },
                      })
                    }
                    className="border-2 hover:border-primary-300 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <span className="bg-yellow-100 text-yellow-800 p-1 rounded-md mr-2">
                    <Search className="h-4 w-4" />
                  </span>
                  Student
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    value={studentSearchQuery}
                    onChange={(e) => setStudentSearchQuery(e.target.value)}
                    placeholder="Search by name or reg. no."
                    className="search-input pl-10 border-2 hover:border-primary-300 transition-colors"
                  />

                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>

                  {studentSearchLoading && (
                    <div className="absolute inset-y-0 right-3 flex items-center">
                      <div className="loader ease-linear rounded-full border-2 border-t-2 border-gray-200 h-4 w-4"></div>
                    </div>
                  )}

                  <StudentSearchResults
                    results={studentSearchResults}
                    query={studentSearchQuery}
                    onSelect={selectStudent}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <span className="bg-red-100 text-red-800 p-1 rounded-md mr-2">
                    <CalendarIcon className="h-4 w-4" />
                  </span>
                  Rotation
                </label>
                <Select
                  value={filters.rotation}
                  onValueChange={(value) => useSchedulerStore.setState({ filters: { ...filters, rotation: value } })}
                >
                  <SelectTrigger className="w-full border-2 hover:border-primary-300 transition-colors">
                    <SelectValue placeholder="Select rotation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Rotations</SelectItem>
                    <SelectItem value="GM">General Medicine</SelectItem>
                    <SelectItem value="PY">Psychiatry</SelectItem>
                    <SelectItem value="CA">Casualty</SelectItem>
                    <SelectItem value="EN">ENT</SelectItem>
                    <SelectItem value="GS">General Surgery</SelectItem>
                    <SelectItem value="AN">Anesthesia</SelectItem>
                    <SelectItem value="OR">Orthopedics</SelectItem>
                    <SelectItem value="OP">Ophthalmology</SelectItem>
                    <SelectItem value="OB">Obstetrics</SelectItem>
                    <SelectItem value="PE">Pediatrics</SelectItem>
                    <SelectItem value="RM">Respiratory</SelectItem>
                    <SelectItem value="RA">Radiology</SelectItem>
                    <SelectItem value="DE">Dermatology</SelectItem>
                    <SelectItem value="YO">YO</SelectItem>
                    <SelectItem value="FP">FP</SelectItem>
                    <SelectItem value="LM">LM</SelectItem>
                    <SelectItem value="FM">FM</SelectItem>
                    <SelectItem value="CH">CH</SelectItem>
                    <SelectItem value="PH">PH</SelectItem>
                    <SelectItem value="UH">UH</SelectItem>
                    <SelectItem value="RH">RH</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <span className="bg-indigo-100 text-indigo-800 p-1 rounded-md mr-2">
                    <CalendarIcon className="h-4 w-4" />
                  </span>
                  Set Current Date
                </label>
                <div className="flex space-x-2">
                  <Input
                    type="date"
                    value={jumpToDate}
                    onChange={(e) => setJumpToDate(e.target.value)}
                    className="border-2 hover:border-primary-300 transition-colors"
                  />
                  <Button onClick={jumpToSelectedDate} className="bg-primary-600 hover:bg-primary-700 text-white">
                    Set Date
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                onClick={applyFilters}
                className="bg-primary-600 hover:bg-primary-700 text-white shadow-md transition-all hover:shadow-lg"
              >
                <Check className="h-5 w-5 mr-1.5" />
                Apply Filters
              </Button>
              <Button
                variant="outline"
                onClick={resetFilters}
                className="border-primary-600 text-primary-600 hover:bg-primary-50 shadow-sm transition-all hover:shadow-md"
              >
                <RotateCcw className="h-5 w-5 mr-1.5" />
                Reset
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
