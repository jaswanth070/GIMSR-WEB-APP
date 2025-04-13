"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronDown, Filter, RotateCcw, Check } from "lucide-react"
import { useSchedulerStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { StudentSearchResults } from "@/components/student-search-results"

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
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-primary-700 flex items-center">
          <Filter className="h-5 w-5 mr-2" />
          Filters
        </h2>
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFilters}
            className="text-primary-700 hover:text-primary-500 hover:bg-primary-50"
          >
            <ChevronDown className={cn("h-6 w-6", !showFilters && "rotate-180")} />
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="space-y-6 animate-in fade-in-50 slide-in-from-top-5 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Batch</label>
              <Select
                value={filters.batch}
                onValueChange={(value) => useSchedulerStore.setState({ filters: { ...filters, batch: value } })}
              >
                <SelectTrigger className="w-full">
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
              <label className="block text-sm font-medium text-gray-700">Phase</label>
              <Select
                value={filters.phase}
                onValueChange={(value) => useSchedulerStore.setState({ filters: { ...filters, phase: value } })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select phase" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Phases</SelectItem>
                  <SelectItem value="M">Medicine</SelectItem>
                  <SelectItem value="S">Surgery</SelectItem>
                  <SelectItem value="O">OBGY</SelectItem>
                  <SelectItem value="Misc">Misc</SelectItem>
                  <SelectItem value="CM">Community Medicine</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Date Range</label>
              <div className="flex space-x-2">
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) =>
                    useSchedulerStore.setState({
                      filters: { ...filters, startDate: e.target.value },
                    })
                  }
                />
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) =>
                    useSchedulerStore.setState({
                      filters: { ...filters, endDate: e.target.value },
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Student</label>
              <div className="relative">
                <Input
                  type="text"
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                  placeholder="Search by name or reg. no."
                  className="search-input pl-10"
                />

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
              <label className="block text-sm font-medium text-gray-700">Rotation</label>
              <Select
                value={filters.rotation}
                onValueChange={(value) => useSchedulerStore.setState({ filters: { ...filters, rotation: value } })}
              >
                <SelectTrigger className="w-full">
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
              <label className="block text-sm font-medium text-gray-700">Set Current Date</label>
              <div className="flex space-x-2">
                <Input type="date" value={jumpToDate} onChange={(e) => setJumpToDate(e.target.value)} />
                <Button onClick={jumpToSelectedDate}>Set Date</Button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={applyFilters} className="bg-primary-600 hover:bg-primary-700">
              <Check className="h-5 w-5 mr-1.5" />
              Apply Filters
            </Button>
            <Button
              variant="outline"
              onClick={resetFilters}
              className="border-primary-600 text-primary-600 hover:bg-primary-50"
            >
              <RotateCcw className="h-5 w-5 mr-1.5" />
              Reset
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
