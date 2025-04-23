"use client"
import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Calendar, ZoomIn, ZoomOut, RefreshCw } from "lucide-react"
import { useSchedulerStore } from "@/lib/store"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import dayjs from "dayjs"
import { TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

export function TimelineView() {
  const {
    students,
    schedule,
    rotations,
    getRotationColorClass,
    getRotationName,
    formatDate,
    viewFullSchedule,
    getCurrentDate,
  } = useSchedulerStore()

  const [loading, setLoading] = useState(true)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [viewMode, setViewMode] = useState("batch")
  const [selectedBatch, setSelectedBatch] = useState("all")
  const [selectedPhase, setSelectedPhase] = useState("all")
  const [collisions, setCollisions] = useState<any[]>([])
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const today = getCurrentDate()

  // Calculate timeline dates
  const startDate = dayjs("2025-04-01")
  const endDate = startDate.add(52, "week")
  const totalDays = endDate.diff(startDate, "day")

  useEffect(() => {
    // Simulate loading
    setLoading(true)
    setTimeout(() => {
      detectCollisions()
      setLoading(false)
    }, 800)
  }, [selectedBatch, selectedPhase, viewMode])

  // Scroll to current date when component mounts
  useEffect(() => {
    if (timelineRef.current && !loading) {
      const currentDayPosition = (today.diff(startDate, "day") / totalDays) * 100 * zoomLevel
      const scrollPosition =
        (timelineRef.current.scrollWidth * currentDayPosition) / 100 - timelineRef.current.clientWidth / 2
      timelineRef.current.scrollLeft = Math.max(0, scrollPosition)
    }
  }, [loading, zoomLevel])

  // Detect schedule collisions
  const detectCollisions = () => {
    const detected: any[] = []

    // Filter students by batch if needed
    const relevantStudents = selectedBatch !== "all" ? students.filter((s) => s.batch === selectedBatch) : students

    // For each student, check if they have overlapping rotations
    relevantStudents.forEach((student) => {
      const studentSchedule = schedule.filter((s) => s.studentId === student.id)

      // Filter by phase if selected
      const filteredSchedule =
        selectedPhase !== "all"
          ? studentSchedule.filter((s) => {
              const rotation = rotations.find((r) => r.code === s.rotation)
              return rotation && rotation.phase === selectedPhase
            })
          : studentSchedule

      // Check for overlaps in this student's schedule
      for (let i = 0; i < filteredSchedule.length; i++) {
        for (let j = i + 1; j < filteredSchedule.length; j++) {
          const a = filteredSchedule[i]
          const b = filteredSchedule[j]

          const aStart = dayjs(a.startDate)
          const aEnd = dayjs(a.endDate)
          const bStart = dayjs(b.startDate)
          const bEnd = dayjs(b.endDate)

          // Check for overlap
          if (aStart <= bEnd && aEnd >= bStart) {
            detected.push({
              studentId: student.id,
              studentName: student.name,
              regdNo: student.regdNo,
              batch: student.batch,
              rotationA: a.rotation,
              rotationB: b.rotation,
              startDate: bStart > aStart ? bStart.format("YYYY-MM-DD") : aStart.format("YYYY-MM-DD"),
              endDate: bEnd < aEnd ? bEnd.format("YYYY-MM-DD") : aEnd.format("YYYY-MM-DD"),
              daysOverlap: dayjs(bEnd < aEnd ? bEnd : aEnd).diff(bStart > aStart ? bStart : aStart, "day") + 1,
            })
          }
        }
      }
    })

    setCollisions(detected)
  }

  // Generate timeline items based on view mode
  const generateTimelineItems = () => {
    if (viewMode === "batch") {
      return generateBatchTimeline()
    } else if (viewMode === "student") {
      return generateStudentTimeline()
    } else {
      return generateRotationTimeline()
    }
  }

  // Generate batch-based timeline
  const generateBatchTimeline = () => {
    const batches = ["A", "B", "C", "D"]
    const filteredBatches = selectedBatch !== "all" ? batches.filter((b) => b === selectedBatch) : batches

    return (
      <div className="space-y-6">
        {filteredBatches.map((batch) => (
          <div key={batch} className="relative">
            <div className="flex items-center mb-2">
              <div
                className={`w-4 h-4 rounded-full mr-2 ${
                  batch === "A"
                    ? "bg-blue-500"
                    : batch === "B"
                      ? "bg-green-500"
                      : batch === "C"
                        ? "bg-purple-500"
                        : "bg-yellow-500"
                }`}
              ></div>
              <h3 className="text-lg font-semibold">Batch {batch}</h3>
            </div>

            <div className="relative h-24 bg-gray-100 rounded-lg overflow-hidden">
              {/* Timeline ruler */}
              <div className="absolute top-0 left-0 w-full h-6 bg-gray-200 flex">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 border-r border-gray-300 text-xs text-gray-500 flex items-center justify-center"
                  >
                    {startDate.add(i * 4, "week").format("MMM")}
                  </div>
                ))}
              </div>

              {/* Current date indicator */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20"
                style={{
                  left: `${(today.diff(startDate, "day") / totalDays) * 100 * zoomLevel}%`,
                  height: "100%",
                }}
              >
                <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-red-500 rounded-full"></div>
              </div>

              {/* Phase blocks */}
              <div className="absolute top-6 left-0 right-0 bottom-0 flex flex-col">
                <div className="flex-1 relative">
                  {schedule
                    .filter((s) => students.find((st) => st.id === s.studentId)?.batch === batch)
                    .reduce((phases: any[], item) => {
                      const rotation = rotations.find((r) => r.code === item.rotation)
                      if (!rotation) return phases

                      // Filter by phase if selected
                      if (selectedPhase !== "all" && rotation.phase !== selectedPhase) return phases

                      const phase = rotation.phase
                      const existingPhase = phases.find((p) => p.phase === phase)

                      if (existingPhase) {
                        const startDate = dayjs(item.startDate)
                        const endDate = dayjs(item.endDate)

                        if (startDate.isBefore(dayjs(existingPhase.startDate))) {
                          existingPhase.startDate = item.startDate
                        }

                        if (endDate.isAfter(dayjs(existingPhase.endDate))) {
                          existingPhase.endDate = item.endDate
                        }

                        return phases
                      } else {
                        return [
                          ...phases,
                          {
                            phase,
                            startDate: item.startDate,
                            endDate: item.endDate,
                          },
                        ]
                      }
                    }, [])
                    .sort((a, b) => dayjs(a.startDate).diff(dayjs(b.startDate)))
                    .map((phaseBlock, idx) => {
                      const start = dayjs(phaseBlock.startDate)
                      const end = dayjs(phaseBlock.endDate)
                      const left = (start.diff(startDate, "day") / totalDays) * 100
                      const width = (end.diff(start, "day") / totalDays) * 100

                      const getPhaseColor = (phase: string) => {
                        switch (phase) {
                          case "M":
                            return "bg-blue-200 border-blue-400 text-blue-800"
                          case "S":
                            return "bg-green-200 border-green-400 text-green-800"
                          case "O":
                            return "bg-purple-200 border-purple-400 text-purple-800"
                          case "Misc":
                            return "bg-yellow-200 border-yellow-400 text-yellow-800"
                          case "CM":
                            return "bg-red-200 border-red-400 text-red-800"
                          default:
                            return "bg-gray-200 border-gray-400 text-gray-800"
                        }
                      }

                      const getPhaseName = (phase: string) => {
                        switch (phase) {
                          case "M":
                            return "Medicine"
                          case "S":
                            return "Surgery"
                          case "O":
                            return "OBGY"
                          case "Misc":
                            return "Miscellaneous"
                          case "CM":
                            return "Community Medicine"
                          default:
                            return phase
                        }
                      }

                      return (
                        <div
                          key={idx}
                          className={`absolute h-full border-2 ${getPhaseColor(phaseBlock.phase)} flex items-center justify-center text-xs font-medium transition-all duration-200 hover:shadow-lg cursor-pointer`}
                          style={{
                            left: `${left * zoomLevel}%`,
                            width: `${width * zoomLevel}%`,
                            transform: hoveredItem === `phase-${batch}-${idx}` ? "translateY(-2px)" : "none",
                            zIndex: hoveredItem === `phase-${batch}-${idx}` ? 10 : 1,
                          }}
                          onMouseEnter={() => setHoveredItem(`phase-${batch}-${idx}`)}
                          onMouseLeave={() => setHoveredItem(null)}
                        >
                          <div className="truncate px-2">{getPhaseName(phaseBlock.phase)}</div>

                          {hoveredItem === `phase-${batch}-${idx}` && (
                            <div className="absolute bottom-full mb-2 bg-white p-2 rounded shadow-lg z-20 w-64">
                              <p className="font-bold">{getPhaseName(phaseBlock.phase)}</p>
                              <p className="text-xs text-gray-600">
                                {formatDate(phaseBlock.startDate)} - {formatDate(phaseBlock.endDate)}
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Generate student-based timeline
  const generateStudentTimeline = () => {
    // Filter students by batch if selected
    let filteredStudents = selectedBatch !== "all" ? students.filter((s) => s.batch === selectedBatch) : students

    // Filter out placeholder students
    filteredStudents = filteredStudents.filter((s) => !s.regdNo.includes("PLACEHOLDER"))

    // Limit to 15 students for performance
    const displayStudents = filteredStudents.slice(0, 15)

    return (
      <div className="space-y-4">
        {displayStudents.map((student) => (
          <div key={student.id} className="relative">
            <div className="flex items-center mb-2 justify-between">
              <div className="flex items-center">
                <div
                  className={`w-3 h-3 rounded-full mr-2 ${
                    student.batch === "A"
                      ? "bg-blue-500"
                      : student.batch === "B"
                        ? "bg-green-500"
                        : student.batch === "C"
                          ? "bg-purple-500"
                          : "bg-yellow-500"
                  }`}
                ></div>
                <h3 className="text-sm font-medium truncate">{student.name}</h3>
              </div>
              <span className="text-xs text-gray-500">{student.regdNo}</span>
            </div>

            <div className="relative h-12 bg-gray-100 rounded-lg overflow-hidden">
              {/* Current date indicator */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20"
                style={{
                  left: `${(today.diff(startDate, "day") / totalDays) * 100 * zoomLevel}%`,
                  height: "100%",
                }}
              >
                <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-red-500 rounded-full"></div>
              </div>

              {/* Rotation blocks */}
              <div className="absolute inset-0">
                {schedule
                  .filter((s) => s.studentId === student.id)
                  .filter((s) => {
                    // Filter by phase if selected
                    if (selectedPhase === "all") return true
                    const rotation = rotations.find((r) => r.code === s.rotation)
                    return rotation && rotation.phase === selectedPhase
                  })
                  .map((item, idx) => {
                    const start = dayjs(item.startDate)
                    const end = dayjs(item.endDate)
                    const left = (start.diff(startDate, "day") / totalDays) * 100
                    const width = (end.diff(start, "day") / totalDays) * 100

                    // Check if this item is part of a collision
                    const hasCollision = collisions.some(
                      (c) =>
                        c.studentId === student.id && (c.rotationA === item.rotation || c.rotationB === item.rotation),
                    )

                    // Check if rotation is completed
                    const isCompleted = end.isBefore(today)

                    return (
                      <div
                        key={idx}
                        className={`absolute h-full ${getRotationColorClass(item.rotation)} flex items-center justify-center text-xs font-medium transition-all duration-200 hover:shadow-lg cursor-pointer ${hasCollision ? "border-2 border-red-500" : ""} ${isCompleted ? "opacity-70" : ""}`}
                        style={{
                          left: `${left * zoomLevel}%`,
                          width: `${width * zoomLevel}%`,
                          transform: hoveredItem === `rotation-${student.id}-${idx}` ? "translateY(-2px)" : "none",
                          zIndex: hoveredItem === `rotation-${student.id}-${idx}` ? 10 : 1,
                        }}
                        onMouseEnter={() => setHoveredItem(`rotation-${student.id}-${idx}`)}
                        onMouseLeave={() => setHoveredItem(null)}
                        onClick={() => viewFullSchedule(student.id)}
                      >
                        <div className="truncate px-1">{item.rotation}</div>

                        {hoveredItem === `rotation-${student.id}-${idx}` && (
                          <div className="absolute bottom-full mb-2 bg-white p-2 rounded shadow-lg z-20 w-64">
                            <p className="font-bold">{getRotationName(item.rotation)}</p>
                            <p className="text-xs text-gray-600">
                              {formatDate(item.startDate)} - {formatDate(item.endDate)}
                            </p>
                            {isCompleted && <p className="text-xs text-green-600 font-bold mt-1">Status: Completed</p>}
                            {hasCollision && (
                              <p className="text-xs text-red-600 font-bold mt-1">
                                Warning: Schedule conflict detected!
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
              </div>
            </div>
          </div>
        ))}

        {filteredStudents.length > 15 && (
          <div className="text-center text-sm text-gray-500 mt-4">
            Showing 15 of {filteredStudents.length} students. Use filters to narrow down results.
          </div>
        )}
      </div>
    )
  }

  // Generate rotation-based timeline
  const generateRotationTimeline = () => {
    // Group rotations by phase
    const rotationsByPhase = rotations.reduce((acc: any, rotation) => {
      // Filter by phase if selected
      if (selectedPhase !== "all" && rotation.phase !== selectedPhase) return acc

      if (!acc[rotation.phase]) {
        acc[rotation.phase] = []
      }
      acc[rotation.phase].push(rotation)
      return acc
    }, {})

    return (
      <div className="space-y-8">
        {Object.entries(rotationsByPhase).map(([phase, phaseRotations]: [string, any]) => (
          <div key={phase} className="space-y-4">
            <h3 className="text-lg font-semibold">
              {phase === "M"
                ? "Medicine"
                : phase === "S"
                  ? "Surgery"
                  : phase === "O"
                    ? "OBGY"
                    : phase === "Misc"
                      ? "Miscellaneous"
                      : phase === "CM"
                        ? "Community Medicine"
                        : phase}
            </h3>

            {phaseRotations.map((rotation: any) => (
              <div key={rotation.code} className="relative">
                <div className="flex items-center mb-2">
                  <div className={`px-2 py-0.5 rounded text-xs ${getRotationColorClass(rotation.code)}`}>
                    {rotation.code}
                  </div>
                  <h4 className="text-sm font-medium ml-2">{rotation.name}</h4>
                </div>

                <div className="relative h-10 bg-gray-100 rounded-lg overflow-hidden">
                  {/* Current date indicator */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20"
                    style={{
                      left: `${(today.diff(startDate, "day") / totalDays) * 100 * zoomLevel}%`,
                      height: "100%",
                    }}
                  >
                    <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-red-500 rounded-full"></div>
                  </div>

                  {/* Student blocks */}
                  <div className="absolute inset-0">
                    {schedule
                      .filter((s) => s.rotation === rotation.code)
                      .filter(
                        (s) =>
                          selectedBatch === "all" ||
                          students.find((st) => st.id === s.studentId)?.batch === selectedBatch,
                      )
                      .map((item, idx) => {
                        const student = students.find((s) => s.id === item.studentId)
                        if (!student) return null

                        const start = dayjs(item.startDate)
                        const end = dayjs(item.endDate)
                        const left = (start.diff(startDate, "day") / totalDays) * 100
                        const width = (end.diff(start, "day") / totalDays) * 100

                        // Check if this item is part of a collision
                        const hasCollision = collisions.some(
                          (c) =>
                            c.studentId === student.id &&
                            (c.rotationA === item.rotation || c.rotationB === item.rotation),
                        )

                        // Check if rotation is completed
                        const isCompleted = end.isBefore(today)

                        const getBatchColor = (batch: string) => {
                          switch (batch) {
                            case "A":
                              return "bg-blue-200 border-blue-400"
                            case "B":
                              return "bg-green-200 border-green-400"
                            case "C":
                              return "bg-purple-200 border-purple-400"
                            case "D":
                              return "bg-yellow-200 border-yellow-400"
                            default:
                              return "bg-gray-200 border-gray-400"
                          }
                        }

                        return (
                          <div
                            key={idx}
                            className={`absolute h-full ${getBatchColor(student.batch)} flex items-center justify-center text-xs font-medium transition-all duration-200 hover:shadow-lg cursor-pointer ${hasCollision ? "border-2 border-red-500" : "border"} ${isCompleted ? "opacity-70" : ""}`}
                            style={{
                              left: `${left * zoomLevel}%`,
                              width: `${width * zoomLevel}%`,
                              transform:
                                hoveredItem === `student-${rotation.code}-${idx}` ? "translateY(-2px)" : "none",
                              zIndex: hoveredItem === `student-${rotation.code}-${idx}` ? 10 : 1,
                            }}
                            onMouseEnter={() => setHoveredItem(`student-${rotation.code}-${idx}`)}
                            onMouseLeave={() => setHoveredItem(null)}
                          >
                            <div className="truncate px-1">{student.batch}</div>

                            {hoveredItem === `student-${rotation.code}-${idx}` && (
                              <div className="absolute bottom-full mb-2 bg-white p-2 rounded shadow-lg z-20 w-64">
                                <p className="font-bold">{student.name}</p>
                                <p className="text-xs text-gray-600">{student.regdNo}</p>
                                <p className="text-xs text-gray-600">
                                  {formatDate(item.startDate)} - {formatDate(item.endDate)}
                                </p>
                                {isCompleted && (
                                  <p className="text-xs text-green-600 font-bold mt-1">Status: Completed</p>
                                )}
                                {hasCollision && (
                                  <p className="text-xs text-red-600 font-bold mt-1">
                                    Warning: Schedule conflict detected!
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }

  // Timeline ruler for the top of the view
  const renderTimelineRuler = () => {
    return (
      <div className="relative h-10 mb-4 border-b border-gray-300">
        <div className="absolute inset-0 flex">
          {Array.from({ length: 53 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 border-r border-gray-300 flex flex-col items-center justify-center"
              style={{ width: `${(1 / 53) * 100 * zoomLevel}%` }}
            >
              <span className="text-xs text-gray-500">{i + 1}</span>
              <span className="text-xs text-gray-400">{startDate.add(i, "week").format("MMM D")}</span>
            </div>
          ))}
        </div>

        {/* Current date indicator on ruler */}
        <div
          className="absolute bottom-0 w-0.5 bg-red-500 z-20"
          style={{
            left: `${(today.diff(startDate, "day") / totalDays) * 100 * zoomLevel}%`,
            height: "100%",
          }}
        >
          <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="absolute -bottom-6 -left-10 w-20 text-center">
            <span className="text-xs font-bold bg-red-100 text-red-800 px-2 py-1 rounded">Today</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="mb-6 border border-gray-100">
      <CardHeader className="pb-2">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle className="text-xl font-semibold text-primary-700 flex items-center">
            <Calendar className="h-6 w-6 mr-2" />
            Advanced Timeline View
          </CardTitle>

          <div className="flex flex-wrap gap-2 items-center">
            <Select value={viewMode} onValueChange={setViewMode}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="View Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="batch">By Batch</SelectItem>
                <SelectItem value="student">By Student</SelectItem>
                <SelectItem value="rotation">By Rotation</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedBatch} onValueChange={setSelectedBatch}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Select Batch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Batches</SelectItem>
                <SelectItem value="A">Batch A</SelectItem>
                <SelectItem value="B">Batch B</SelectItem>
                <SelectItem value="C">Batch C</SelectItem>
                <SelectItem value="D">Batch D</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedPhase} onValueChange={setSelectedPhase}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Select Phase" />
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

            <div className="flex items-center space-x-1 bg-gray-100 rounded-md p-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.5))}
                disabled={zoomLevel <= 0.5}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-xs font-medium w-12 text-center">{zoomLevel}x</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.5))}
                disabled={zoomLevel >= 3}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>

            <TooltipProvider>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    if (timelineRef.current) {
                      const currentDayPosition = (today.diff(startDate, "day") / totalDays) * 100 * zoomLevel
                      const scrollPosition =
                        (timelineRef.current.scrollWidth * currentDayPosition) / 100 -
                        timelineRef.current.clientWidth / 2
                      timelineRef.current.scrollLeft = Math.max(0, scrollPosition)
                    }
                  }}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Scroll to current date</p>
              </TooltipContent>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <LoadingSpinner message="Loading timeline data..." />
          </div>
        ) : (
          <div className="animate-in fade-in-50 duration-300">
            {collisions.length > 0 && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Schedule Conflicts Detected</AlertTitle>
                <AlertDescription>
                  Found {collisions.length} schedule conflicts. These are highlighted in red on the timeline.
                </AlertDescription>
              </Alert>
            )}

            <div className="overflow-x-auto" ref={timelineRef}>
              <div className="min-w-full" style={{ width: `${100 * zoomLevel}%` }}>
                {renderTimelineRuler()}
                {generateTimelineItems()}
              </div>
            </div>

            {collisions.length > 0 && (
              <div className="mt-6 border rounded-lg overflow-hidden">
                <div className="bg-red-50 p-3 border-b border-red-200">
                  <h3 className="text-red-800 font-medium flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Schedule Conflicts
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Student</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Batch</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Conflict</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Period</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Days</th>
                      </tr>
                    </thead>
                    <tbody>
                      {collisions.slice(0, 5).map((collision, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="px-4 py-2">
                            <div className="font-medium">{collision.regdNo}</div>
                            <div className="text-xs text-gray-500">{collision.studentName}</div>
                          </td>
                          <td className="px-4 py-2">
                            <Badge variant="outline">{collision.batch}</Badge>
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex items-center space-x-2">
                              <span
                                className={`px-2 py-0.5 rounded text-xs ${getRotationColorClass(collision.rotationA)}`}
                              >
                                {collision.rotationA}
                              </span>
                              <span>and</span>
                              <span
                                className={`px-2 py-0.5 rounded text-xs ${getRotationColorClass(collision.rotationB)}`}
                              >
                                {collision.rotationB}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {collision.startDate} to {collision.endDate}
                          </td>
                          <td className="px-4 py-2 text-sm font-medium text-red-600">{collision.daysOverlap} days</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {collisions.length > 5 && (
                  <div className="p-3 text-center text-sm text-gray-500">
                    Showing 5 of {collisions.length} conflicts
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
