import { create } from "zustand"
import dayjs, { type Dayjs } from "dayjs"
import weekOfYear from "dayjs/plugin/weekOfYear"
import isoWeek from "dayjs/plugin/isoWeek"
import customParseFormat from "dayjs/plugin/customParseFormat"
import type { Student, ScheduleItem, RotationDefinition, Rotation, Phase, Filters, WeekInfo } from "@/lib/types"
import Papa from "papaparse"

// Initialize dayjs plugins
dayjs.extend(weekOfYear)
dayjs.extend(isoWeek)
dayjs.extend(customParseFormat)

export interface StoreState {
  // Data
  students: Student[]
  schedule: ScheduleItem[]
  rotations: RotationDefinition[]
  phases: Phase[]
  batchPhases: Record<string, string[]>
  batches: string[]

  // Filters
  filters: Filters

  // View settings
  viewType: "dashboard" | "calendar" | "student" | "rotation" | "batch"
  currentViewStartDate: Dayjs
  currentViewEndDate: Dayjs
  jumpToDate: string
  showFilters: boolean

  // Search and filter
  studentSearchQuery: string
  studentSearchResults: Student[]
  studentListSearch: string
  subPhaseStudentSearch: string

  // Loading states
  loading: boolean
  loadingMessage: string
  loadingSubMessage: string
  calendarLoading: boolean
  studentViewLoading: boolean
  rotationViewLoading: boolean
  batchViewLoading: boolean
  studentSearchLoading: boolean
  dataLoading: boolean

  // Modals
  showFullScheduleModal: boolean
  showSubPhaseStudentsModal: boolean
  showExportLoadingModal: boolean
  selectedStudentId: string | null
  selectedRotation: string | null

  // Filtered Students
  filteredStudents: Student[]

  // Store original today date
  originalToday: typeof dayjs | null
  customToday: Dayjs | null

  // Methods
  initialize: () => Promise<void>
  setViewType: (viewType: "dashboard" | "calendar" | "student" | "rotation" | "batch") => void
  toggleFilters: () => void
  setStudentSearchQuery: (query: string) => void
  setStudentListSearch: (search: string) => void
  setSubPhaseStudentSearch: (search: string) => void
  setJumpToDate: (date: string) => void
  selectStudent: (studentId: string) => void
  jumpToSelectedDate: () => void
  applyFilters: () => void
  resetFilters: () => void
  viewFullSchedule: (studentId: string) => void
  closeFullScheduleModal: () => void
  viewStudentsInRotation: (rotationCode: string) => void
  closeSubPhaseStudentsModal: () => void
  viewBatchStudents: (batch: string) => void
  previousWeek: () => void
  nextWeek: () => void
  prepareAndExportToCSV: () => void
  exportStudentScheduleToCSV: (studentId: string) => void
  exportRotationDataToCSV: (rotationCode: string) => void

  // Helper methods
  getCurrentDate: () => Dayjs
  formatDateRange: (start: Dayjs, end: Dayjs) => string
  formatDate: (date: Date | null) => string
  getStudentName: (studentId: string | null) => string
  getRotationName: (rotationCode: string) => string
  getPhaseName: (phaseCode: string) => string
  getRotationColorClass: (rotation: string) => string
  isToday: (date: Dayjs) => boolean
  getCurrentWeekDates: () => Dayjs[]
  getStudentsForDate: (date: Dayjs) => (Student & { rotation: string })[]
  getFilteredStudents: () => Student[]
  getFilteredStudentsList: () => Student[]
  getFilteredSchedule: () => ScheduleItem[]
  getStudentRotationForDate: (studentId: string, date: Dayjs) => ScheduleItem | undefined
  getStudentRotationForWeek: (studentId: string, weekStartDate: Dayjs) => ScheduleItem | undefined
  getCurrentRotationForStudent: (studentId: string) => {
    rotation: string
    startDate: Date | null
    endDate: Date | null
  }
  getNextRotationForStudent: (studentId: string) => ScheduleItem | null
  getFullScheduleForStudent: (studentId: string | null) => WeekInfo[]
  getFullScheduleByPhase: (studentId: string | null) => Record<string, WeekInfo[]>
  getStudentsInRotation: (rotationCode: string) => Student[]
  getAllRotations: () => Rotation[]
  getActiveRotations: () => Rotation[]
  getActiveRotationsCount: () => number
  getCurrentPhaseForBatch: (batch: string) => { phase: string; startDate: Date | null; endDate: Date | null }
  getNextPhaseForBatch: (batch: string) => { phase: string } | null
  getStudentCountInBatch: (batch: string) => number
  getCurrentWeek: () => number
  getCompletionPercentage: () => number
  getFilteredSubPhaseStudents: () => (Student & { startDate: Date | null; endDate: Date | null })[]
  getCompletedRotationsForStudent: (studentId: string) => string[]
  getActualStudentCount: () => number

  // Data loading functions
  loadStudentsFromCSV: () => Promise<void>
  generateStudents: () => void
  defineRotations: () => void
  definePhases: () => void
  defineBatchPhases: () => void
  generateSchedule: () => void
  generateMedicinePhase: (
    batch: string,
    students: Student[],
    startDate: Dayjs,
    endDate: Dayjs,
    schedule: ScheduleItem[],
  ) => void
  generateSurgeryPhase: (
    batch: string,
    students: Student[],
    startDate: Dayjs,
    endDate: Dayjs,
    schedule: ScheduleItem[],
  ) => void
  generateOBGYPhase: (
    batch: string,
    students: Student[],
    startDate: Dayjs,
    endDate: Dayjs,
    schedule: ScheduleItem[],
  ) => void
  generateMiscPhase: (
    batch: string,
    students: Student[],
    startDate: Dayjs,
    endDate: Dayjs,
    schedule: ScheduleItem[],
  ) => void
  generateCommunityMedicinePhase: (
    batch: string,
    students: Student[],
    startDate: Dayjs,
    endDate: Dayjs,
    schedule: ScheduleItem[],
  ) => void
  assignStudentsToRotation: (
    students: Student[],
    rotation: string,
    startDate: Dayjs,
    endDate: Dayjs,
    schedule: ScheduleItem[],
  ) => void
}

export const useSchedulerStore = create<StoreState>((set, get) => ({
  // Initial state
  students: [],
  schedule: [],
  rotations: [],
  phases: [],
  batchPhases: {},
  batches: [],

  filters: {
    batch: "all",
    phase: "all",
    rotation: "all",
    student: "all",
    startDate: "",
    endDate: "",
  },

  viewType: "dashboard",
  currentViewStartDate: dayjs(),
  currentViewEndDate: dayjs().add(6, "day"),
  jumpToDate: dayjs().format("YYYY-MM-DD"),
  showFilters: true,

  studentSearchQuery: "",
  studentSearchResults: [],
  studentListSearch: "",
  subPhaseStudentSearch: "",

  loading: true,
  loadingMessage: "Initializing...",
  loadingSubMessage: "Please wait while we set up the scheduler",
  calendarLoading: false,
  studentViewLoading: false,
  rotationViewLoading: false,
  batchViewLoading: false,
  studentSearchLoading: false,
  dataLoading: false,

  showFullScheduleModal: false,
  showSubPhaseStudentsModal: false,
  showExportLoadingModal: false,
  selectedStudentId: null,
  selectedRotation: null,

  filteredStudents: [],

  originalToday: null,
  customToday: null,

  // Initialize the scheduler
  initialize: async () => {
    // Set initial date range
    const startDate = dayjs("2025-04-01")
    const today = dayjs() // Use actual current date instead of fixed date

    set({
      currentViewStartDate: startDate,
      currentViewEndDate: startDate.add(6, "day"),
      filters: {
        ...get().filters,
        startDate: startDate.format("YYYY-MM-DD"),
        endDate: startDate.add(52, "week").format("YYYY-MM-DD"),
      },
      jumpToDate: today.format("YYYY-MM-DD"), // Set to current date
      originalToday: dayjs,
      customToday: today,
    })

    // If the viewType was previously set to "timeline", change it to "dashboard"
    if (get().viewType === "timeline") {
      set({ viewType: "dashboard" })
    }

    // Load student data
    set({ loadingMessage: "Loading student data...", loadingSubMessage: "Fetching student records" })
    await get().loadStudentsFromCSV()

    // Define rotations
    set({ loadingMessage: "Defining rotations...", loadingSubMessage: "Setting up rotation definitions" })
    get().defineRotations()

    // Define phases
    set({ loadingMessage: "Defining phases...", loadingSubMessage: "Setting up phase definitions" })
    get().definePhases()

    // Set up batch phases
    set({ loadingMessage: "Setting up batch phases...", loadingSubMessage: "Configuring batch phase sequences" })
    get().defineBatchPhases()

    // Generate schedule
    set({ loadingMessage: "Generating schedule...", loadingSubMessage: "Creating rotation schedules for all students" })
    get().generateSchedule()

    // Initialize filtered students
    const filteredStudents = get().getFilteredStudents()
    set({ filteredStudents })

    // Finish loading
    set({
      loadingMessage: "Ready!",
      loadingSubMessage: "Loading complete",
      loading: false,
    })

    return Promise.resolve()
  },

  // Data loading functions
  loadStudentsFromCSV: async () => {
    try {
      set({ dataLoading: true, loadingSubMessage: "Fetching student data from CSV..." })

      // Fetch CSV data
      const response = await fetch(
        "https://raw.githubusercontent.com/jaswanth070/GIMSR-WEB-APP/refs/heads/main/students_with_batches.csv",
      )
      const csvData = await response.text()

      set({ loadingSubMessage: "Parsing student data..." })

      // Parse CSV
      const results = Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
      })

      let students: Student[] = []

      // Process the CSV data
      results.data.forEach((row: any, index: number) => {
        const regdNo = row["Regd. No."]
        const name = row["Name of the student"]
        const batch = row["Batch"]

        if (regdNo && name && batch) {
          students.push({
            id: `${batch}${String(index + 1).padStart(2, "0")}`,
            regdNo: regdNo,
            name: name,
            batch: batch,
          })
        }
      })

      // Ensure we have exactly 34 students per batch
      const batches = ["A", "B", "C", "D"]
      set({ batches })
      batches.forEach((batch) => {
        const batchStudents = students.filter((s) => s.batch === batch)

        // If we have less than 34 students in a batch, add placeholder students
        if (batchStudents.length < 34) {
          for (let i = batchStudents.length + 1; i <= 34; i++) {
            students.push({
              id: `${batch}${String(i).padStart(2, "0")}`,
              regdNo: `PLACEHOLDER-${batch}${i}`,
              name: `Placeholder Student ${batch}${i}`,
              batch: batch,
            })
          }
        }

        // If we have more than 34 students in a batch, remove excess students
        if (batchStudents.length > 34) {
          const excessCount = batchStudents.length - 34
          const excessStudents = batchStudents.slice(-excessCount)
          students = students.filter((s) => !excessStudents.includes(s))
        }
      })

      set({
        students,
        loadingSubMessage: `Loaded ${students.length} students`,
        dataLoading: false,
      })
    } catch (error) {
      console.error("Error loading students from CSV:", error)
      set({ loadingSubMessage: "Error loading student data. Generating random data instead." })

      // Fallback to random data generation
      get().generateStudents()
      set({ dataLoading: false })
    }
  },

  // Generate random student data as fallback
  generateStudents: () => {
    const firstNames = [
      "John",
      "Jane",
      "Michael",
      "Emily",
      "David",
      "Sarah",
      "James",
      "Emma",
      "Robert",
      "Olivia",
      "William",
      "Sophia",
      "Joseph",
      "Ava",
      "Thomas",
      "Isabella",
      "Charles",
      "Mia",
      "Daniel",
      "Charlotte",
    ]
    const lastNames = [
      "Smith",
      "Johnson",
      "Williams",
      "Brown",
      "Jones",
      "Miller",
      "Davis",
      "Garcia",
      "Rodriguez",
      "Wilson",
      "Martinez",
      "Anderson",
      "Taylor",
      "Thomas",
      "Hernandez",
      "Moore",
      "Martin",
      "Jackson",
      "Thompson",
      "White",
    ]

    const batches = ["A", "B", "C", "D"]
    set({ batches })
    const students: Student[] = []

    // Generate 34 students for each batch (136 total)
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex]

      for (let i = 1; i <= 34; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]

        students.push({
          id: `${batch}${i.toString().padStart(2, "0")}`,
          regdNo: `12201610${batch}${i.toString().padStart(3, "0")}`,
          name: `${firstName} ${lastName}`,
          batch: batch,
        })
      }
    }

    set({ students })
  },

  // Define rotations
  defineRotations: () => {
    const rotations: RotationDefinition[] = [
      { code: "GM", name: "General Medicine", phase: "MED" },
      { code: "PY", name: "Psychiatry", phase: "MED" },
      { code: "CA", name: "Casualty", phase: "MED" },
      { code: "EN", name: "ENT", phase: "MED" },

      { code: "GS", name: "General Surgery", phase: "SUR" },
      { code: "AN", name: "Anesthesia", phase: "SUR" },
      { code: "OR", name: "Orthopedics", phase: "SUR" },
      { code: "OP", name: "Ophthalmology", phase: "SUR" },

      { code: "OB", name: "Obstetrics", phase: "OBG" },
      { code: "PE", name: "Pediatrics", phase: "OBG" },
      { code: "RM", name: "Respiratory Medicine", phase: "OBG" },
      { code: "RA", name: "Radiology", phase: "OBG" },
      { code: "DE", name: "Dermatology", phase: "OBG" },

      { code: "YO", name: "Yoga", phase: "OTH" },
      { code: "FP", name: "Family Planning", phase: "OTH" },
      { code: "LM", name: "Legal Medicine", phase: "OTH" },
      { code: "FM", name: "Forensic Medicine", phase: "OTH" },

      { code: "CH", name: "Community Health", phase: "COM" },
      { code: "PH", name: "Public Health", phase: "COM" },
      { code: "UH", name: "Urban Health", phase: "COM" },
      { code: "RH", name: "Rural Health", phase: "COM" },
    ]

    set({ rotations })
  },

  // Define phases
  definePhases: () => {
    const phases: Phase[] = [
      { code: "MED", name: "Medicine", weeks: 12 },
      { code: "SUR", name: "Surgery", weeks: 12 },
      { code: "OBG", name: "OBGY", weeks: 12 },
      { code: "OTH", name: "Others", weeks: 4 },
      { code: "COM", name: "Community Medicine", weeks: 12 },
    ]

    set({ phases })
  },

  // Define batch phases
  defineBatchPhases: () => {
    const batchPhases: Record<string, string[]> = {
      A: ["MED", "SUR", "OBG", "OTH", "COM"],
      B: ["SUR", "OBG", "OTH", "COM", "MED"],
      C: ["OBG", "OTH", "COM", "MED", "SUR"],
      D: ["OTH", "COM", "MED", "SUR", "OBG"],
    }

    set({ batchPhases })
  },

  // Generate schedule
  generateSchedule: () => {
    const schedule: ScheduleItem[] = []
    const startDate = dayjs("2025-04-01")
    const { students, batchPhases } = get()

    // For each batch
    for (const batch of ["A", "B", "C", "D"]) {
      const batchStudents = students.filter((s) => s.batch === batch)
      let currentDate = startDate

      // For each phase in the batch's sequence
      for (const phaseCode of batchPhases[batch]) {
        const phase = get().phases.find((p) => p.code === phaseCode)
        if (!phase) continue

        const phaseEndDate = currentDate.add(phase.weeks, "week").subtract(1, "day")

        // Generate rotations based on phase type
        if (phaseCode === "MED") {
          get().generateMedicinePhase(batch, batchStudents, currentDate, phaseEndDate, schedule)
        } else if (phaseCode === "SUR") {
          get().generateSurgeryPhase(batch, batchStudents, currentDate, phaseEndDate, schedule)
        } else if (phaseCode === "OBG") {
          get().generateOBGYPhase(batch, batchStudents, currentDate, phaseEndDate, schedule)
        } else if (phaseCode === "OTH") {
          get().generateMiscPhase(batch, batchStudents, currentDate, phaseEndDate, schedule)
        } else if (phaseCode === "COM") {
          get().generateCommunityMedicinePhase(batch, batchStudents, currentDate, phaseEndDate, schedule)
        }

        // Move to next phase
        currentDate = phaseEndDate.add(1, "day")
      }
    }

    set({ schedule })
  },

  // Generate Medicine phase schedule
  generateMedicinePhase: (
    batch: string,
    students: Student[],
    startDate: Dayjs,
    endDate: Dayjs,
    schedule: ScheduleItem[],
  ) => {
    const midpointDate = startDate.add(6, "week").subtract(1, "day")
    const secondHalfStartDate = midpointDate.add(1, "day")

    // Split students into two groups
    const group1 = students.slice(0, 17)
    const group2 = students.slice(17)

    // First half: Group 1 in GM, Group 2 in rotations
    get().assignStudentsToRotation(group1, "GM", startDate, midpointDate, schedule)

    // Split Group 2 into subgroups
    const subgroupA = group2.slice(0, 6)
    const subgroupB = group2.slice(6, 12)
    const subgroupC = group2.slice(12)

    // Assign rotations for first half
    // Group A: PY → CA → EN
    get().assignStudentsToRotation(subgroupA, "PY", startDate, startDate.add(1, "week").add(6, "day"), schedule)
    get().assignStudentsToRotation(
      subgroupA,
      "CA",
      startDate.add(2, "week"),
      startDate.add(3, "week").add(6, "day"),
      schedule,
    )
    get().assignStudentsToRotation(subgroupA, "EN", startDate.add(4, "week"), midpointDate, schedule)

    // Group B: CA → EN → PY
    get().assignStudentsToRotation(subgroupB, "CA", startDate, startDate.add(1, "week").add(6, "day"), schedule)
    get().assignStudentsToRotation(
      subgroupB,
      "EN",
      startDate.add(2, "week"),
      startDate.add(3, "week").add(6, "day"),
      schedule,
    )
    get().assignStudentsToRotation(subgroupB, "PY", startDate.add(4, "week"), midpointDate, schedule)

    // Group C: EN → PY → CA
    get().assignStudentsToRotation(subgroupC, "EN", startDate, startDate.add(1, "week").add(6, "day"), schedule)
    get().assignStudentsToRotation(
      subgroupC,
      "PY",
      startDate.add(2, "week"),
      startDate.add(3, "week").add(6, "day"),
      schedule,
    )
    get().assignStudentsToRotation(subgroupC, "CA", startDate.add(4, "week"), midpointDate, schedule)

    // Second half: Group 2 in GM, Group 1 in rotations
    get().assignStudentsToRotation(group2, "GM", secondHalfStartDate, endDate, schedule)

    // Split Group 1 into subgroups
    const subgroupD = group1.slice(0, 6)
    const subgroupE = group1.slice(6, 12)
    const subgroupF = group1.slice(12)

    // Assign rotations for second half
    // Group D: PY → CA → EN
    get().assignStudentsToRotation(
      subgroupD,
      "PY",
      secondHalfStartDate,
      secondHalfStartDate.add(1, "week").add(6, "day"),
      schedule,
    )
    get().assignStudentsToRotation(
      subgroupD,
      "CA",
      secondHalfStartDate.add(2, "week"),
      secondHalfStartDate.add(3, "week").add(6, "day"),
      schedule,
    )
    get().assignStudentsToRotation(subgroupD, "EN", secondHalfStartDate.add(4, "week"), endDate, schedule)

    // Group E: CA → EN → PY
    get().assignStudentsToRotation(
      subgroupE,
      "CA",
      secondHalfStartDate,
      secondHalfStartDate.add(1, "week").add(6, "day"),
      schedule,
    )
    get().assignStudentsToRotation(
      subgroupE,
      "EN",
      secondHalfStartDate.add(2, "week"),
      secondHalfStartDate.add(3, "week").add(6, "day"),
      schedule,
    )
    get().assignStudentsToRotation(subgroupE, "PY", secondHalfStartDate.add(4, "week"), endDate, schedule)

    // Group F: EN → PY → CA
    get().assignStudentsToRotation(
      subgroupF,
      "EN",
      secondHalfStartDate,
      secondHalfStartDate.add(1, "week").add(6, "day"),
      schedule,
    )
    get().assignStudentsToRotation(
      subgroupF,
      "PY",
      secondHalfStartDate.add(2, "week"),
      secondHalfStartDate.add(3, "week").add(6, "day"),
      schedule,
    )
    get().assignStudentsToRotation(subgroupF, "CA", secondHalfStartDate.add(4, "week"), endDate, schedule)
  },

  // Generate Surgery phase schedule
  generateSurgeryPhase: (
    batch: string,
    students: Student[],
    startDate: Dayjs,
    endDate: Dayjs,
    schedule: ScheduleItem[],
  ) => {
    const midpointDate = startDate.add(6, "week").subtract(1, "day")
    const secondHalfStartDate = midpointDate.add(1, "day")

    // Split students into two groups
    const group1 = students.slice(0, 17)
    const group2 = students.slice(17)

    // First half: Group 1 in GS, Group 2 in rotations
    get().assignStudentsToRotation(group1, "GS", startDate, midpointDate, schedule)

    // Split Group 2 into subgroups
    const subgroupA = group2.slice(0, 6)
    const subgroupB = group2.slice(6, 12)
    const subgroupC = group2.slice(12)

    // Assign rotations for first half
    // Group A: AN → OR → OP
    get().assignStudentsToRotation(subgroupA, "AN", startDate, startDate.add(1, "week").add(6, "day"), schedule)
    get().assignStudentsToRotation(
      subgroupA,
      "OR",
      startDate.add(2, "week"),
      startDate.add(3, "week").add(6, "day"),
      schedule,
    )
    get().assignStudentsToRotation(subgroupA, "OP", startDate.add(4, "week"), midpointDate, schedule)

    // Group B: OR → OP → AN
    get().assignStudentsToRotation(subgroupB, "OR", startDate, startDate.add(1, "week").add(6, "day"), schedule)
    get().assignStudentsToRotation(
      subgroupB,
      "OP",
      startDate.add(2, "week"),
      startDate.add(3, "week").add(6, "day"),
      schedule,
    )
    get().assignStudentsToRotation(subgroupB, "AN", startDate.add(4, "week"), midpointDate, schedule)

    // Group C: OP → AN → OR
    get().assignStudentsToRotation(subgroupC, "OP", startDate, startDate.add(1, "week").add(6, "day"), schedule)
    get().assignStudentsToRotation(
      subgroupC,
      "AN",
      startDate.add(2, "week"),
      startDate.add(3, "week").add(6, "day"),
      schedule,
    )
    get().assignStudentsToRotation(subgroupC, "OR", startDate.add(4, "week"), midpointDate, schedule)

    // Second half: Group 2 in GS, Group 1 in rotations
    get().assignStudentsToRotation(group2, "GS", secondHalfStartDate, endDate, schedule)

    // Split Group 1 into subgroups
    const subgroupD = group1.slice(0, 6)
    const subgroupE = group1.slice(6, 12)
    const subgroupF = group1.slice(12)

    // Assign rotations for second half
    // Group D: AN → OR → OP
    get().assignStudentsToRotation(
      subgroupD,
      "AN",
      secondHalfStartDate,
      secondHalfStartDate.add(1, "week").add(6, "day"),
      schedule,
    )
    get().assignStudentsToRotation(
      subgroupD,
      "OR",
      secondHalfStartDate.add(2, "week"),
      secondHalfStartDate.add(3, "week").add(6, "day"),
      schedule,
    )
    get().assignStudentsToRotation(subgroupD, "OP", secondHalfStartDate.add(4, "week"), endDate, schedule)

    // Group E: OR → OP → AN
    get().assignStudentsToRotation(
      subgroupE,
      "OR",
      secondHalfStartDate,
      secondHalfStartDate.add(1, "week").add(6, "day"),
      schedule,
    )
    get().assignStudentsToRotation(
      subgroupE,
      "OP",
      secondHalfStartDate.add(2, "week"),
      secondHalfStartDate.add(3, "week").add(6, "day"),
      schedule,
    )
    get().assignStudentsToRotation(subgroupE, "AN", secondHalfStartDate.add(4, "week"), endDate, schedule)

    // Group F: OP → AN → OR
    get().assignStudentsToRotation(
      subgroupF,
      "OP",
      secondHalfStartDate,
      secondHalfStartDate.add(1, "week").add(6, "day"),
      schedule,
    )
    get().assignStudentsToRotation(
      subgroupF,
      "AN",
      secondHalfStartDate.add(2, "week"),
      secondHalfStartDate.add(3, "week").add(6, "day"),
      schedule,
    )
    get().assignStudentsToRotation(subgroupF, "OR", secondHalfStartDate.add(4, "week"), endDate, schedule)
  },

  // Generate OBGY phase schedule
  generateOBGYPhase: (
    batch: string,
    students: Student[],
    startDate: Dayjs,
    endDate: Dayjs,
    schedule: ScheduleItem[],
  ) => {
    // Split the 12-week period into two 6-week periods
    const midpointDate = startDate.add(6, "week").subtract(1, "day")
    const secondHalfStartDate = midpointDate.add(1, "day")

    // Split students into two main groups (G1 and G2)
    const group1 = students.slice(0, 17) // First 17 students
    const group2 = students.slice(17) // Remaining 17 students

    // FIRST 6 WEEKS
    // G1 does OB for 6 weeks
    get().assignStudentsToRotation(group1, "OB", startDate, midpointDate, schedule)

    // G2 is further divided:
    // SG1 (8 students) does PE for first 3 weeks
    const sg1FirstHalf = group2.slice(0, 8)
    get().assignStudentsToRotation(sg1FirstHalf, "PE", startDate, startDate.add(2, "week").add(6, "day"), schedule)

    // Remaining students (SG2, SG3, SG4) rotate through RM, RA, DE
    const rotationGroup1 = group2.slice(8)

    // SG2 (3 students): RM -> RA -> DE
    const sg2 = rotationGroup1.slice(0, 3)
    get().assignStudentsToRotation(sg2, "RM", startDate, startDate.add(0, "week").add(6, "day"), schedule)
    get().assignStudentsToRotation(
      sg2,
      "RA",
      startDate.add(1, "week"),
      startDate.add(1, "week").add(6, "day"),
      schedule,
    )
    get().assignStudentsToRotation(
      sg2,
      "DE",
      startDate.add(2, "week"),
      startDate.add(2, "week").add(6, "day"),
      schedule,
    )

    // SG3 (3 students): RA -> DE -> RM
    const sg3 = rotationGroup1.slice(3, 6)
    get().assignStudentsToRotation(sg3, "RA", startDate, startDate.add(0, "week").add(6, "day"), schedule)
    get().assignStudentsToRotation(
      sg3,
      "DE",
      startDate.add(1, "week"),
      startDate.add(1, "week").add(6, "day"),
      schedule,
    )
    get().assignStudentsToRotation(
      sg3,
      "RM",
      startDate.add(2, "week"),
      startDate.add(2, "week").add(6, "day"),
      schedule,
    )

    // SG4 (3 students): DE -> RM -> RA
    const sg4 = rotationGroup1.slice(6)
    get().assignStudentsToRotation(sg4, "DE", startDate, startDate.add(0, "week").add(6, "day"), schedule)
    get().assignStudentsToRotation(
      sg4,
      "RM",
      startDate.add(1, "week"),
      startDate.add(1, "week").add(6, "day"),
      schedule,
    )
    get().assignStudentsToRotation(
      sg4,
      "RA",
      startDate.add(2, "week"),
      startDate.add(2, "week").add(6, "day"),
      schedule,
    )

    // For second 3 weeks of first half, swap SG1 with merged SG2+SG3+SG4
    // SG1 now rotates through specialties for second 3 weeks
    const secondThreeWeeksStart = startDate.add(3, "week")
    const secondThreeWeeksEnd = midpointDate

    // Divide SG1 into 3 roughly equal subgroups
    const sg1a = sg1FirstHalf.slice(0, 3)
    const sg1b = sg1FirstHalf.slice(3, 6)
    const sg1c = sg1FirstHalf.slice(6)

    // SG1a: RM
    get().assignStudentsToRotation(sg1a, "RM", secondThreeWeeksStart, secondThreeWeeksEnd, schedule)
    // SG1b: RA
    get().assignStudentsToRotation(sg1b, "RA", secondThreeWeeksStart, secondThreeWeeksEnd, schedule)
    // SG1c: DE
    get().assignStudentsToRotation(sg1c, "DE", secondThreeWeeksStart, secondThreeWeeksEnd, schedule)

    // Merged SG2+SG3+SG4 does PE for second 3 weeks
    get().assignStudentsToRotation(rotationGroup1, "PE", secondThreeWeeksStart, secondThreeWeeksEnd, schedule)

    // SECOND 6 WEEKS - Swap G1 and G2
    // G2 does OB for 6 weeks
    get().assignStudentsToRotation(group2, "OB", secondHalfStartDate, endDate, schedule)

    // G1 is further divided:
    // First 8 students do PE for first 3 weeks
    const sg1SecondHalf = group1.slice(0, 8)
    get().assignStudentsToRotation(
      sg1SecondHalf,
      "PE",
      secondHalfStartDate,
      secondHalfStartDate.add(2, "week").add(6, "day"),
      schedule,
    )

    // Remaining students rotate through RM, RA, DE
    const rotationGroup2 = group1.slice(8)

    // First 3 students: RM -> RA -> DE
    const sg2SecondHalf = rotationGroup2.slice(0, 3)
    get().assignStudentsToRotation(
      sg2SecondHalf,
      "RM",
      secondHalfStartDate,
      secondHalfStartDate.add(0, "week").add(6, "day"),
      schedule,
    )
    get().assignStudentsToRotation(
      sg2SecondHalf,
      "RA",
      secondHalfStartDate.add(1, "week"),
      secondHalfStartDate.add(1, "week").add(6, "day"),
      schedule,
    )
    get().assignStudentsToRotation(
      sg2SecondHalf,
      "DE",
      secondHalfStartDate.add(2, "week"),
      secondHalfStartDate.add(2, "week").add(6, "day"),
      schedule,
    )

    // Next 3 students: RA -> DE -> RM
    const sg3SecondHalf = rotationGroup2.slice(3, 6)
    get().assignStudentsToRotation(
      sg3SecondHalf,
      "RA",
      secondHalfStartDate,
      secondHalfStartDate.add(0, "week").add(6, "day"),
      schedule,
    )
    get().assignStudentsToRotation(
      sg3SecondHalf,
      "DE",
      secondHalfStartDate.add(1, "week"),
      secondHalfStartDate.add(1, "week").add(6, "day"),
      schedule,
    )
    get().assignStudentsToRotation(
      sg3SecondHalf,
      "RM",
      secondHalfStartDate.add(2, "week"),
      secondHalfStartDate.add(2, "week").add(6, "day"),
      schedule,
    )

    // Last 3 students: DE -> RM -> RA
    const sg4SecondHalf = rotationGroup2.slice(6)
    get().assignStudentsToRotation(
      sg4SecondHalf,
      "DE",
      secondHalfStartDate,
      secondHalfStartDate.add(0, "week").add(6, "day"),
      schedule,
    )
    get().assignStudentsToRotation(
      sg4SecondHalf,
      "RM",
      secondHalfStartDate.add(1, "week"),
      secondHalfStartDate.add(1, "week").add(6, "day"),
      schedule,
    )
    get().assignStudentsToRotation(
      sg4SecondHalf,
      "RA",
      secondHalfStartDate.add(2, "week"),
      secondHalfStartDate.add(2, "week").add(6, "day"),
      schedule,
    )

    // For second 3 weeks of second half, swap PE group with rotation group
    const secondHalfThreeWeeksStart = secondHalfStartDate.add(3, "week")
    const secondHalfThreeWeeksEnd = endDate

    // Divide PE group into 3 roughly equal subgroups
    const sg1aSecondHalf = sg1SecondHalf.slice(0, 3)
    const sg1bSecondHalf = sg1SecondHalf.slice(3, 6)
    const sg1cSecondHalf = sg1SecondHalf.slice(6)

    // Assign rotations for second 3 weeks
    get().assignStudentsToRotation(sg1aSecondHalf, "RM", secondHalfThreeWeeksStart, secondHalfThreeWeeksEnd, schedule)
    get().assignStudentsToRotation(sg1bSecondHalf, "RA", secondHalfThreeWeeksStart, secondHalfThreeWeeksEnd, schedule)
    get().assignStudentsToRotation(sg1cSecondHalf, "DE", secondHalfThreeWeeksStart, secondHalfThreeWeeksEnd, schedule)

    // Merged rotation group does PE for second 3 weeks
    get().assignStudentsToRotation(rotationGroup2, "PE", secondHalfThreeWeeksStart, secondHalfThreeWeeksEnd, schedule)
  },

  // Generate Misc phase schedule
  generateMiscPhase: (
    batch: string,
    students: Student[],
    startDate: Dayjs,
    endDate: Dayjs,
    schedule: ScheduleItem[],
  ) => {
    // Split students into 4 groups
    const group1 = students.slice(0, 9)
    const group2 = students.slice(9, 17)
    const group3 = students.slice(17, 26)
    const group4 = students.slice(26)

    // Weekly rotations for 4 weeks
    for (let week = 0; week < 4; week++) {
      const weekStartDate = startDate.add(week, "week")
      const weekEndDate = weekStartDate.add(6, "day")

      // Rotate groups through YO, FP, LM, FM
      if (week % 4 === 0) {
        get().assignStudentsToRotation(group1, "YO", weekStartDate, weekEndDate, schedule)
        get().assignStudentsToRotation(group2, "FP", weekStartDate, weekEndDate, schedule)
        get().assignStudentsToRotation(group3, "LM", weekStartDate, weekEndDate, schedule)
        get().assignStudentsToRotation(group4, "FM", weekStartDate, weekEndDate, schedule)
      } else if (week % 4 === 1) {
        get().assignStudentsToRotation(group1, "FM", weekStartDate, weekEndDate, schedule)
        get().assignStudentsToRotation(group2, "YO", weekStartDate, weekEndDate, schedule)
        get().assignStudentsToRotation(group3, "FP", weekStartDate, weekEndDate, schedule)
        get().assignStudentsToRotation(group4, "LM", weekStartDate, weekEndDate, schedule)
      } else if (week % 4 === 2) {
        get().assignStudentsToRotation(group1, "LM", weekStartDate, weekEndDate, schedule)
        get().assignStudentsToRotation(group2, "FM", weekStartDate, weekEndDate, schedule)
        get().assignStudentsToRotation(group3, "YO", weekStartDate, weekEndDate, schedule)
        get().assignStudentsToRotation(group4, "FP", weekStartDate, weekEndDate, schedule)
      } else {
        get().assignStudentsToRotation(group1, "FP", weekStartDate, weekEndDate, schedule)
        get().assignStudentsToRotation(group2, "LM", weekStartDate, weekEndDate, schedule)
        get().assignStudentsToRotation(group3, "FM", weekStartDate, weekEndDate, schedule)
        get().assignStudentsToRotation(group4, "YO", weekStartDate, weekEndDate, schedule)
      }
    }
  },

  // Generate Community Medicine phase schedule
  generateCommunityMedicinePhase: (
    batch: string,
    students: Student[],
    startDate: Dayjs,
    endDate: Dayjs,
    schedule: ScheduleItem[],
  ) => {
    // Split students into 4 groups
    const group1 = students.slice(0, 9)
    const group2 = students.slice(9, 17)
    const group3 = students.slice(17, 26)
    const group4 = students.slice(26)

    // Each rotation lasts for 3 consecutive weeks
    // Total 12 weeks divided into 4 rotations of 3 weeks each

    // First 3 weeks
    const period1Start = startDate
    const period1End = startDate.add(2, "week").add(6, "day")
    get().assignStudentsToRotation(group1, "CH", period1Start, period1End, schedule)
    get().assignStudentsToRotation(group2, "PH", period1Start, period1End, schedule)
    get().assignStudentsToRotation(group3, "UH", period1Start, period1End, schedule)
    get().assignStudentsToRotation(group4, "RH", period1Start, period1End, schedule)

    // Second 3 weeks
    const period2Start = period1End.add(1, "day")
    const period2End = period2Start.add(2, "week").add(6, "day")
    get().assignStudentsToRotation(group1, "RH", period2Start, period2End, schedule)
    get().assignStudentsToRotation(group2, "CH", period2Start, period2End, schedule)
    get().assignStudentsToRotation(group3, "PH", period2Start, period2End, schedule)
    get().assignStudentsToRotation(group4, "UH", period2Start, period2End, schedule)

    // Third 3 weeks
    const period3Start = period2End.add(1, "day")
    const period3End = period3Start.add(2, "week").add(6, "day")
    get().assignStudentsToRotation(group1, "UH", period3Start, period3End, schedule)
    get().assignStudentsToRotation(group2, "RH", period3Start, period3End, schedule)
    get().assignStudentsToRotation(group3, "CH", period3Start, period3End, schedule)
    get().assignStudentsToRotation(group4, "PH", period3Start, period3End, schedule)

    // Fourth 3 weeks
    const period4Start = period3End.add(1, "day")
    const period4End = endDate
    get().assignStudentsToRotation(group1, "PH", period4Start, period4End, schedule)
    get().assignStudentsToRotation(group2, "UH", period4Start, period4End, schedule)
    get().assignStudentsToRotation(group3, "RH", period4Start, period4End, schedule)
    get().assignStudentsToRotation(group4, "CH", period4Start, period4End, schedule)
  },

  // Assign students to rotation
  assignStudentsToRotation: (
    students: Student[],
    rotation: string,
    startDate: Dayjs,
    endDate: Dayjs,
    schedule: ScheduleItem[],
  ) => {
    for (const student of students) {
      schedule.push({
        studentId: student.id,
        rotation: rotation,
        startDate: startDate.toDate(),
        endDate: endDate.toDate(),
      })
    }
  },

  // UI state management
  setViewType: (viewType: "dashboard" | "calendar" | "student" | "rotation" | "batch") => set({ viewType }),

  toggleFilters: () => set((state) => ({ showFilters: !state.showFilters })),

  setStudentSearchQuery: (query) => {
    set({ studentSearchQuery: query, studentSearchLoading: query.length > 1 })

    if (query.length > 1) {
      setTimeout(() => {
        const { students } = get()
        const results = students
          .filter(
            (student) =>
              student.name.toLowerCase().includes(query.toLowerCase()) ||
              student.regdNo.toLowerCase().includes(query.toLowerCase()),
          )
          .slice(0, 10)

        set({ studentSearchResults: results, studentSearchLoading: false })
      }, 300)
    } else {
      set({ studentSearchResults: [] })
    }
  },

  setStudentListSearch: (search) => {
    set({ studentListSearch: search })

    const filteredStudents = get().getFilteredStudentsList()
    set({ filteredStudents, studentViewLoading: false })
  },

  setSubPhaseStudentSearch: (search) => set({ subPhaseStudentSearch: search }),

  setJumpToDate: (date) => set({ jumpToDate: date }),

  selectStudent: (studentId) => {
    set({
      filters: { ...get().filters, student: studentId },
      studentSearchQuery: "",
      studentSearchResults: [],
    })
  },

  jumpToSelectedDate: () => {
    const { jumpToDate } = get()
    if (!jumpToDate) return

    set({
      calendarLoading: true,
      studentViewLoading: true,
      rotationViewLoading: true,
      batchViewLoading: true,
    })

    setTimeout(() => {
      const selectedDate = dayjs(jumpToDate)

      // Set the selected date as the current date for the application
      set({ customToday: selectedDate })

      // Find the start of the week for the selected date
      const weekStart = selectedDate.startOf("week")

      set({
        currentViewStartDate: weekStart,
        currentViewEndDate: weekStart.add(6, "day"),
        calendarLoading: false,
        studentViewLoading: false,
        rotationViewLoading: false,
        batchViewLoading: false,
      })
    }, 300)
  },

  applyFilters: () => {
    set({
      calendarLoading: true,
      studentViewLoading: true,
      rotationViewLoading: true,
      batchViewLoading: true,
    })

    setTimeout(() => {
      const filteredStudents = get().getFilteredStudents()
      set({
        filteredStudents,
        calendarLoading: false,
        studentViewLoading: false,
        rotationViewLoading: false,
        batchViewLoading: false,
      })
    }, 300)
  },

  resetFilters: () => {
    set({
      filters: {
        batch: "all",
        phase: "all",
        rotation: "all",
        student: "all",
        startDate: dayjs("2025-04-01").format("YYYY-MM-DD"),
        endDate: dayjs("2025-04-01").add(52, "week").format("YYYY-MM-DD"),
      },
      studentSearchQuery: "",
      studentSearchResults: [],
      studentListSearch: "",
      calendarLoading: true,
      studentViewLoading: true,
      rotationViewLoading: true,
      batchViewLoading: true,
    })

    setTimeout(() => {
      const filteredStudents = get().getFilteredStudents()
      set({
        filteredStudents,
        calendarLoading: false,
        studentViewLoading: false,
        rotationViewLoading: false,
        batchViewLoading: false,
      })
    }, 300)
  },

  viewFullSchedule: (studentId) => {
    set({
      selectedStudentId: studentId,
      showFullScheduleModal: true,
    })
  },

  closeFullScheduleModal: () => {
    set({ showFullScheduleModal: false })
  },

  viewStudentsInRotation: (rotationCode) => {
    set({
      selectedRotation: rotationCode,
      subPhaseStudentSearch: "",
      showSubPhaseStudentsModal: true,
    })
  },

  closeSubPhaseStudentsModal: () => {
    set({ showSubPhaseStudentsModal: false })
  },

  viewBatchStudents: (batch) => {
    set({
      filters: { ...get().filters, batch },
      viewType: "student",
      studentListSearch: "",
    })

    setTimeout(() => {
      const filteredStudents = get().getFilteredStudentsList()
      set({ filteredStudents })
    }, 300)
  },

  previousWeek: () => {
    set({
      calendarLoading: true,
      studentViewLoading: true,
      rotationViewLoading: true,
      batchViewLoading: true,
    })

    setTimeout(() => {
      const { currentViewStartDate, currentViewEndDate } = get()
      set({
        currentViewStartDate: currentViewStartDate.subtract(7, "day"),
        currentViewEndDate: currentViewEndDate.subtract(7, "day"),
        calendarLoading: false,
        studentViewLoading: false,
        rotationViewLoading: false,
        batchViewLoading: false,
      })
    }, 300)
  },

  nextWeek: () => {
    set({
      calendarLoading: true,
      studentViewLoading: true,
      rotationViewLoading: true,
      batchViewLoading: true,
    })

    setTimeout(() => {
      const { currentViewStartDate, currentViewEndDate } = get()
      set({
        currentViewStartDate: currentViewStartDate.add(7, "day"),
        currentViewEndDate: currentViewEndDate.add(7, "day"),
        calendarLoading: false,
        studentViewLoading: false,
        rotationViewLoading: false,
        batchViewLoading: false,
      })
    }, 300)
  },

  // Helper functions
  getCurrentDate: () => {
    const { customToday } = get()
    return customToday || dayjs()
  },

  formatDateRange: (start, end) => {
    return `${start.format("MMM DD, YYYY")} - ${end.format("MMM DD, YYYY")}`
  },

  formatDate: (date) => {
    if (!date) return "N/A"
    return dayjs(date).format("MMM DD, YYYY")
  },

  getStudentName: (studentId) => {
    if (!studentId) return ""
    const student = get().students.find((s) => s.id === studentId)
    return student ? `${student.regdNo} - ${student.name}` : studentId
  },

  getRotationName: (rotationCode) => {
    const rotation = get().rotations.find((r) => r.code === rotationCode)
    return rotation ? rotation.name : rotationCode
  },

  getPhaseName: (phaseCode) => {
    const phase = get().phases.find((p) => p.code === phaseCode)
    return phase ? phase.name : phaseCode
  },

  getRotationColorClass: (rotation) => {
    const colorMap: Record<string, string> = {
      // Medicine phase
      GM: "bg-blue-100 text-blue-800",
      PY: "bg-blue-100 text-blue-800",
      CA: "bg-blue-100 text-blue-800",
      EN: "bg-blue-100 text-blue-800",

      // Surgery phase
      GS: "bg-green-100 text-green-800",
      AN: "bg-green-100 text-green-800",
      OR: "bg-green-100 text-green-800",
      OP: "bg-green-100 text-green-800",

      // OBGY phase
      OB: "bg-purple-100 text-purple-800",
      PE: "bg-purple-100 text-purple-800",
      RM: "bg-purple-100 text-purple-800",
      RA: "bg-purple-100 text-purple-800",
      DE: "bg-purple-100 text-purple-800",

      // Misc phase
      YO: "bg-yellow-100 text-yellow-800",
      FP: "bg-yellow-100 text-yellow-800",
      LM: "bg-yellow-100 text-yellow-800",
      FM: "bg-yellow-100 text-yellow-800",

      // Community Medicine phase
      CH: "bg-red-100 text-red-800",
      PH: "bg-red-100 text-red-800",
      UH: "bg-red-100 text-red-800",
      RH: "bg-red-100 text-red-800",
    }

    return colorMap[rotation] || "bg-gray-100 text-gray-800"
  },

  isToday: (date) => {
    const today = get().getCurrentDate()
    return today.format("YYYY-MM-DD") === date.format("YYYY-MM-DD")
  },

  getCurrentWeekDates: () => {
    const dates: Dayjs[] = []
    const { currentViewStartDate } = get()

    for (let i = 0; i < 7; i++) {
      dates.push(currentViewStartDate.add(i, "day"))
    }

    return dates
  },

  getStudentsForDate: (date) => {
    const dateStr = date.format("YYYY-MM-DD")
    const { schedule, students } = get()

    const schedules = get()
      .getFilteredSchedule()
      .filter(
        (s) => dayjs(s.startDate).format("YYYY-MM-DD") <= dateStr && dayjs(s.endDate).format("YYYY-MM-DD") >= dateStr,
      )

    return schedules.map((s) => {
      const student = students.find((student) => student.id === s.studentId)
      if (!student)
        return { id: s.studentId, regdNo: "Unknown", name: "Unknown", batch: "Unknown", rotation: s.rotation }

      return {
        ...student,
        rotation: s.rotation,
      }
    })
  },

  getFilteredStudents: () => {
    const { students, filters } = get()
    let filtered = [...students]

    if (filters.batch !== "all") {
      filtered = filtered.filter((s) => s.batch === filters.batch)
    }

    if (filters.student !== "all") {
      filtered = filtered.filter((s) => s.id === filters.student)
    }

    return filtered
  },

  getFilteredStudentsList: () => {
    const { studentListSearch } = get()
    let filtered = get().getFilteredStudents()

    if (studentListSearch) {
      const search = studentListSearch.toLowerCase()
      filtered = filtered.filter(
        (s) => s.name.toLowerCase().includes(search) || s.regdNo.toLowerCase().includes(search),
      )
    }

    return filtered
  },

  getFilteredSchedule: () => {
    const { schedule, students, rotations, filters } = get()
    let filtered = [...schedule]

    if (filters.batch !== "all") {
      const batchStudents = students.filter((s) => s.batch === filters.batch).map((s) => s.id)
      filtered = filtered.filter((s) => batchStudents.includes(s.studentId))
    }

    if (filters.phase !== "all") {
      const phaseRotations = rotations.filter((r) => r.phase === filters.phase).map((r) => r.code)
      filtered = filtered.filter((s) => phaseRotations.includes(s.rotation))
    }

    if (filters.rotation !== "all") {
      filtered = filtered.filter((s) => s.rotation === filters.rotation)
    }

    if (filters.student !== "all") {
      filtered = filtered.filter((s) => s.studentId === filters.student)
    }

    if (filters.startDate && filters.endDate) {
      const startDate = dayjs(filters.startDate)
      const endDate = dayjs(filters.endDate)

      filtered = filtered.filter((s) => {
        const scheduleStart = dayjs(s.startDate)
        const scheduleEnd = dayjs(s.endDate)

        return (
          (scheduleStart.isBefore(endDate) || scheduleStart.isSame(endDate)) &&
          (scheduleEnd.isAfter(startDate) || scheduleEnd.isSame(startDate))
        )
      })
    }

    return filtered
  },

  getStudentRotationForDate: (studentId, date) => {
    const dateStr = date.format("YYYY-MM-DD")
    const { schedule } = get()

    return schedule.find(
      (s) =>
        s.studentId === studentId &&
        dayjs(s.startDate).format("YYYY-MM-DD") <= dateStr &&
        dayjs(s.endDate).format("YYYY-MM-DD") >= dateStr,
    )
  },

  getStudentRotationForWeek: (studentId, weekStartDate) => {
    // Get the middle of the week to find the rotation
    const midWeekDate = weekStartDate.add(3, "day")
    return get().getStudentRotationForDate(studentId, midWeekDate)
  },

  getCurrentRotationForStudent: (studentId) => {
    const today = get().getCurrentDate()
    const { schedule } = get()

    const rotation = schedule.find(
      (s) => s.studentId === studentId && dayjs(s.startDate) <= today && dayjs(s.endDate) >= today,
    )

    return rotation || { rotation: "None", startDate: null, endDate: null }
  },

  getNextRotationForStudent: (studentId) => {
    const today = get().getCurrentDate()
    const { schedule } = get()

    const futureRotations = schedule
      .filter((s) => s.studentId === studentId && dayjs(s.startDate) > today)
      .sort((a, b) => dayjs(a.startDate).diff(dayjs(b.startDate)))

    return futureRotations.length > 0 ? futureRotations[0] : null
  },

  getFullScheduleForStudent: (studentId) => {
    if (!studentId) return []

    const { schedule, rotations } = get()
    const studentSchedule = schedule
      .filter((s) => s.studentId === studentId)
      .sort((a, b) => dayjs(a.startDate).diff(dayjs(b.startDate)))

    const startDate = dayjs("2025-04-01")
    const weeks: WeekInfo[] = []
    const today = get().getCurrentDate()

    // Generate 53 weeks of data
    for (let week = 0; week < 53; week++) {
      const weekStartDate = startDate.add(week, "week")
      const weekEndDate = weekStartDate.add(6, "day")

      // Check each day of the week to find rotations
      // This ensures we don't miss any short rotations that might not include the middle of the week
      let foundRotation = null

      for (let day = 0; day <= 6; day++) {
        const checkDate = weekStartDate.add(day, "day")
        const dayRotation = schedule.find(
          (s) => s.studentId === studentId && dayjs(s.startDate) <= checkDate && dayjs(s.endDate) >= checkDate,
        )

        if (dayRotation) {
          foundRotation = dayRotation
          break
        }
      }

      if (foundRotation) {
        // Find the correct phase for this rotation
        const rotation = rotations.find((r) => r.code === foundRotation.rotation)
        const rotationPhase = rotation ? rotation.phase : ""

        weeks.push({
          weekNumber: week + 1,
          dateRange: get().formatDateRange(weekStartDate, weekEndDate),
          rotation: foundRotation.rotation,
          phase: rotationPhase,
          isCurrentWeek: today >= weekStartDate && today <= weekEndDate,
        })
      } else {
        weeks.push({
          weekNumber: week + 1,
          dateRange: get().formatDateRange(weekStartDate, weekEndDate),
          rotation: "N/A",
          phase: "",
          isCurrentWeek: today >= weekStartDate && today <= weekEndDate,
        })
      }
    }

    return weeks
  },

  getFullScheduleByPhase: (studentId) => {
    if (!studentId) return {}

    const fullSchedule = get().getFullScheduleForStudent(studentId)
    const scheduleByPhase: Record<string, WeekInfo[]> = {}

    // Group weeks by phase
    fullSchedule.forEach((week) => {
      if (week.phase) {
        if (!scheduleByPhase[week.phase]) {
          scheduleByPhase[week.phase] = []
        }
        scheduleByPhase[week.phase].push(week)
      } else if (week.rotation !== "N/A") {
        if (!scheduleByPhase["Other"]) {
          scheduleByPhase["Other"] = []
        }
        scheduleByPhase["Other"].push(week)
      }
    })

    return scheduleByPhase
  },

  getStudentsInRotation: (rotationCode) => {
    const today = get().getCurrentDate()
    const { schedule, students } = get()

    const rotationSchedules = get()
      .getFilteredSchedule()
      .filter((s) => s.rotation === rotationCode && dayjs(s.startDate) <= today && dayjs(s.endDate) >= today)

    return rotationSchedules
      .map((s) => students.find((student) => student.id === s.studentId))
      .filter((s): s is Student => s !== undefined)
  },

  getAllRotations: () => {
    const today = get().getCurrentDate()
    const { rotations, schedule } = get()
    const allRotations: Rotation[] = []

    // Include all rotations, even if no students are currently assigned
    for (const rotation of rotations) {
      const students = get()
        .getFilteredSchedule()
        .filter((s) => s.rotation === rotation.code && dayjs(s.startDate) <= today && dayjs(s.endDate) >= today)

      if (students.length > 0) {
        allRotations.push({
          id: rotation.code,
          code: rotation.code,
          name: rotation.name,
          phase: rotation.phase,
          studentCount: students.length,
          startDate: students[0].startDate,
          endDate: students[0].endDate,
        })
      } else {
        // Include rotations with no students
        allRotations.push({
          id: rotation.code,
          code: rotation.code,
          name: rotation.name,
          phase: rotation.phase,
          studentCount: 0,
          startDate: today.toDate(),
          endDate: today.add(1, "week").toDate(),
        })
      }
    }

    // Sort by phase and then by code
    return allRotations.sort((a, b) => {
      if (a.phase !== b.phase) return a.phase.localeCompare(b.phase)
      return a.code.localeCompare(b.code)
    })
  },

  getActiveRotations: () => {
    const today = get().getCurrentDate()
    const { rotations, schedule } = get()
    const activeRotations: Rotation[] = []

    for (const rotation of rotations) {
      const students = get()
        .getFilteredSchedule()
        .filter((s) => s.rotation === rotation.code && dayjs(s.startDate) <= today && dayjs(s.endDate) >= today)

      if (students.length > 0) {
        activeRotations.push({
          id: rotation.code,
          code: rotation.code,
          name: rotation.name,
          phase: rotation.phase,
          studentCount: students.length,
          startDate: students[0].startDate,
          endDate: students[0].endDate,
        })
      }
    }

    return activeRotations
  },

  getActiveRotationsCount: () => {
    return get().getActiveRotations().length
  },

  getCurrentPhaseForBatch: (batch) => {
    const today = get().getCurrentDate()
    const { students, schedule, rotations } = get()

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
    const { selectedRotation, subPhaseStudentSearch, students } = get()
    if (!selectedRotation) return []

    const today = get().getCurrentDate()
    let filteredStudents = get().getStudentsInRotation(selectedRotation)

    if (subPhaseStudentSearch) {
      const search = subPhaseStudentSearch.toLowerCase()
      filteredStudents = filteredStudents.filter(
        (s) => s.name.toLowerCase().includes(search) || s.regdNo.toLowerCase().includes(search),
      )
    }

    const { schedule } = get()

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

  getCompletedRotationsForStudent: (studentId) => {
    const { schedule } = get()
    const today = get().getCurrentDate()

    // Find all rotations that have ended before today
    return schedule.filter((s) => s.studentId === studentId && dayjs(s.endDate).isBefore(today)).map((s) => s.rotation)
  },

  getActualStudentCount: () => {
    const { students } = get()
    // Count students that don't have "PLACEHOLDER" in their regdNo
    return students.filter((s) => !s.regdNo.includes("PLACEHOLDER")).length
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

  // New function to export rotation data to CSV
  exportRotationDataToCSV: (rotationCode) => {
    set({ showExportLoadingModal: true })

    setTimeout(() => {
      try {
        const { students, rotations, getRotationName, getPhaseName, formatDate } = get()
        const today = get().getCurrentDate()
        const rotation = rotations.find((r) => r.code === rotationCode)

        // Get all students currently in this rotation
        const rotationStudents = get().getStudentsInRotation(rotationCode)

        // Get schedule items for these students in this rotation
        const { schedule } = get()
        const rotationSchedules = schedule.filter(
          (s) =>
            s.rotation === rotationCode &&
            rotationStudents.some((student) => student.id === s.studentId) &&
            dayjs(s.startDate) <= today &&
            dayjs(s.endDate) >= today,
        )

        const data = rotationStudents.map((student) => {
          const scheduleItem = rotationSchedules.find((s) => s.studentId === student.id)

          return {
            "Registration Number": student.regdNo,
            "Student Name": student.name,
            Batch: student.batch,
            "Rotation Code": rotationCode,
            "Rotation Name": getRotationName(rotationCode),
            Phase: rotation?.phase || "",
            "Phase Name": getPhaseName(rotation?.phase || ""),
            "Start Date": scheduleItem ? formatDate(scheduleItem.startDate) : "N/A",
            "End Date": scheduleItem ? formatDate(scheduleItem.endDate) : "N/A",
            "Duration (Days)": scheduleItem
              ? dayjs(scheduleItem.endDate).diff(dayjs(scheduleItem.startDate), "day") + 1
              : 0,
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
        link.setAttribute("download", `rotation_${rotationCode}_students_${dayjs().format("YYYY-MM-DD")}.csv`)
        link.style.visibility = "hidden"

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // Hide loading modal after export is complete
        setTimeout(() => {
          set({ showExportLoadingModal: false })
        }, 500)
      } catch (error) {
        console.error("Error exporting rotation data:", error)
        set({ showExportLoadingModal: false })
        alert("An error occurred while exporting rotation data. Please try again.")
      }
    }, 800)
  },
}))
