import dayjs from "dayjs"
import Papa from "papaparse"
import type { StateCreator } from "zustand"

import type { ScheduleItem, Rotation, Student } from "@/types"
import type { StoreState } from "./store"

export interface DataSlice {
  rotations: Rotation[]
  schedule: ScheduleItem[]
  students: Student[]
  batches: string[]
  batchPhases: Record<string, string[]>

  selectedBatch: string | null
  setSelectedBatch: (batch: string | null) => void

  selectedRotation: string | null
  setSelectedRotation: (rotation: string | null) => void

  subPhaseStudentSearch: string
  setSubPhaseStudentSearch: (search: string) => void

  currentDate: dayjs.Dayjs
  setCurrentDate: (date: dayjs.Dayjs) => void

  showExportLoadingModal: boolean
  setShowExportLoadingModal: (show: boolean) => void

  getRotationName: (code: string) => string
  getPhaseName: (phase: string) => string

  getStudentsInRotation: (rotationCode: string) => Student[]
  getFilteredSchedule: () => ScheduleItem[]
  getFullScheduleForStudent: (studentId: string) => any[]

  getCurrentPhaseForBatch: (batch: string) => { phase: string; startDate: Date | null; endDate: Date | null }
  getNextPhaseForBatch: (batch: string) => { phase: string } | null
  getStudentCountInBatch: (batch: string) => number
  getCurrentWeek: () => number
  getCompletionPercentage: () => number
  getFilteredSubPhaseStudents: () => any[]

  prepareAndExportToCSV: () => void
  exportStudentScheduleToCSV: (studentId: string) => void
}

export const createDataSlice: StateCreator<StoreState, [], [], DataSlice> = (set, get) => ({
  rotations: [],
  schedule: [],
  students: [],
  batches: [],
  batchPhases: {},

  selectedBatch: null,
  setSelectedBatch: (batch) => set({ selectedBatch: batch }),

  selectedRotation: null,
  setSelectedRotation: (rotation) => set({ selectedRotation: rotation }),

  subPhaseStudentSearch: "",
  setSubPhaseStudentSearch: (search) => set({ subPhaseStudentSearch: search }),

  currentDate: dayjs(),
  setCurrentDate: (date) => set({ currentDate: date }),

  showExportLoadingModal: false,
  setShowExportLoadingModal: (show) => set({ showExportLoadingModal: show }),

  getRotationName: (code) => {
    const { rotations } = get()
    return rotations.find((r) => r.code === code)?.name || code
  },

  getPhaseName: (phase) => {
    const { rotations } = get()
    return rotations.find((r) => r.phase === phase)?.phase || phase
  },

  getStudentsInRotation: (rotationCode) => {
    const { schedule, students } = get()
    const today = get().getCurrentDate()

    const studentIds = schedule
      .filter((s) => s.rotation === rotationCode && dayjs(s.startDate) <= today && dayjs(s.endDate) >= today)
      .map((s) => s.studentId)

    return students.filter((s) => studentIds.includes(s.id))
  },

  getFilteredSchedule: () => {
    const { schedule, selectedBatch } = get()

    if (!selectedBatch) return schedule

    return schedule.filter((s) => {
      const student = get().students.find((student) => student.id === s.studentId)
      return student?.batch === selectedBatch
    })
  },

  getFullScheduleForStudent: (studentId) => {
    const { schedule } = get()

    const studentSchedule = schedule.filter((s) => s.studentId === studentId)

    const startDate = dayjs("2025-04-01")
    let currentDate = startDate.clone()
    const endDate = startDate.add(52, "week")

    const weeklySchedule = []
    let weekNumber = 1

    while (currentDate <= endDate) {
      const weekEndDate = currentDate.clone().add(6, "day")

      const scheduleItem = studentSchedule.find(
        (s) => dayjs(s.startDate) <= weekEndDate && dayjs(s.endDate) >= currentDate,
      )

      weeklySchedule.push({
        weekNumber,
        dateRange: `${currentDate.format("YYYY-MM-DD")} - ${weekEndDate.format("YYYY-MM-DD")}`,
        rotation: scheduleItem?.rotation || "N/A",
        phase: get().rotations.find((r) => r.code === scheduleItem?.rotation)?.phase || "N/A",
      })

      currentDate = currentDate.add(7, "day")
      weekNumber++
    }

    return weeklySchedule
  },

  getCurrentPhaseForBatch: (batch) => {
    const { students, schedule, rotations, batches, batchPhases } = get()
    const today = get().getCurrentDate()

    const batchStudents = students.filter((s) => s.batch === batch).map((s) => s.id)
    const currentRotations = schedule.filter(
      (s) => batchStudents.includes(s.studentId) && dayjs(s.startDate) <= today && dayjs(s.endDate) >= today,
    )

    if (currentRotations.length === 0) {
      return { phase: "None", startDate: null, endDate: null }
    }

    const rotationCodes = currentRotations.map((r) => r.rotation)
    const phases = new Set<string>()

    for (const code of rotationCodes) {
      const rotation = rotations.find((r) => r.code === code)
      if (rotation) {
        phases.add(rotation.phase)
      }
    }

    const phase = Array.from(phases)[0]
    const phaseRotations = schedule.filter(
      (s) => batchStudents.includes(s.studentId) && rotations.find((r) => r.code === s.rotation && r.phase === phase),
    )

    const startDates = phaseRotations.map((r) => dayjs(r.startDate))
    const endDates = phaseRotations.map((r) => dayjs(r.endDate))

    return {
      phase,
      startDate: startDates.reduce((a, b) => (a.isBefore(b) ? a : b)).toDate(),
      endDate: endDates.reduce((a, b) => (a.isAfter(b) ? a : b)).toDate(),
    }
  },

  getNextPhaseForBatch: (batch) => {
    const currentPhase = get().getCurrentPhaseForBatch(batch)
    if (currentPhase.phase === "None") return null

    const { batchPhases } = get()
    const phaseSequence = batchPhases[batch]
    const currentIndex = phaseSequence.indexOf(currentPhase.phase)

    if (currentIndex === phaseSequence.length - 1) {
      return null
    }

    return { phase: phaseSequence[currentIndex + 1] }
  },

  getStudentCountInBatch: (batch) => {
    const { students } = get()
    return students.filter((s) => s.batch === batch).length
  },

  getCurrentWeek: () => {
    const startDate = dayjs("2025-04-01")
    const today = get().getCurrentDate()
    return Math.ceil(today.diff(startDate, "day") / 7)
  },

  getCompletionPercentage: () => {
    const startDate = dayjs("2025-04-01")
    const endDate = startDate.add(52, "week")
    const today = get().getCurrentDate()

    const totalDays = endDate.diff(startDate, "day")
    const daysPassed = today.diff(startDate, "day")

    return Math.min(100, Math.max(0, Math.round((daysPassed / totalDays) * 100)))
  },

  getFilteredSubPhaseStudents: () => {
    const { selectedRotation, subPhaseStudentSearch, students, schedule } = get()
    if (!selectedRotation) return []

    const today = get().getCurrentDate()
    let filteredStudents = get().getStudentsInRotation(selectedRotation)

    if (subPhaseStudentSearch) {
      const search = subPhaseStudentSearch.toLowerCase()
      filteredStudents = filteredStudents.filter(
        (s) => s.name.toLowerCase().includes(search) || s.regdNo.toLowerCase().includes(search),
      )
    }

    return filteredStudents.map((student) => {
      const scheduleItem = schedule.find(
        (s) =>
          s.studentId === student.id &&
          s.rotation === selectedRotation &&
          dayjs(s.startDate) <= today &&
          dayjs(s.endDate) >= today,
      )

      return {
        ...student,
        startDate: scheduleItem ? scheduleItem.startDate : null,
        endDate: scheduleItem ? scheduleItem.endDate : null,
      }
    })
  },

  // Export functions
  prepareAndExportToCSV: () => {
    set({ showExportLoadingModal: true })

    // Use setTimeout to allow the loading modal to render
    setTimeout(() => {
      try {
        const { getFilteredSchedule, students, rotations, getRotationName, getPhaseName } = get()

        const data = getFilteredSchedule().map((s) => {
          const student = students.find((student) => student.id === s.studentId)
          const rotation = rotations.find((r) => r.code === s.rotation)

          return {
            "Registration Number": student?.regdNo || "",
            "Student Name": student?.name || "",
            Batch: student?.batch || "",
            "Rotation Code": s.rotation,
            "Rotation Name": getRotationName(s.rotation),
            Phase: rotation?.phase || "",
            "Phase Name": getPhaseName(rotation?.phase || ""),
            "Start Date": dayjs(s.startDate).format("YYYY-MM-DD"),
            "End Date": dayjs(s.endDate).format("YYYY-MM-DD"),
            "Duration (Days)": dayjs(s.endDate).diff(dayjs(s.startDate), "day") + 1,
          }
        })

        // Sort data by batch, then by student name
        data.sort((a, b) => {
          if (a.Batch !== b.Batch) return a.Batch.localeCompare(b.Batch)
          return a["Student Name"].localeCompare(b["Student Name"])
        })

        const csv = Papa.unparse(data)
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)

        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", `medical_rotation_schedule_${dayjs().format("YYYY-MM-DD")}.csv`)
        link.style.visibility = "hidden"

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // Hide loading modal after export is complete
        setTimeout(() => {
          set({ showExportLoadingModal: false })
        }, 500)
      } catch (error) {
        console.error("Error exporting data:", error)
        set({ showExportLoadingModal: false })
        alert("An error occurred while exporting data. Please try again.")
      }
    }, 800)
  },

  exportStudentScheduleToCSV: (studentId) => {
    const { getFullScheduleForStudent, students, getRotationName, getPhaseName } = get()

    const fullSchedule = getFullScheduleForStudent(studentId)
    const student = students.find((s) => s.id === studentId)

    const data = fullSchedule.map((week) => ({
      RegdNo: student?.regdNo || "",
      StudentName: student?.name || "",
      Batch: student?.batch || "",
      Week: week.weekNumber,
      DateRange: week.dateRange,
      Rotation: week.rotation,
      RotationName: getRotationName(week.rotation),
      Phase: week.phase,
      PhaseName: getPhaseName(week.phase),
    }))

    const csv = Papa.unparse(data)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `student_${student?.regdNo || studentId}_schedule.csv`)
    link.style.visibility = "hidden"

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  },
})
