export interface Student {
  id: string
  regdNo: string
  name: string
  batch: string
}

export interface ScheduleItem {
  studentId: string
  rotation: string
  startDate: Date
  endDate: Date
}

export interface RotationDefinition {
  code: string
  name: string
  phase: string
}

export interface Rotation {
  id: string
  code: string
  name: string
  phase: string
  studentCount: number
  startDate: Date
  endDate: Date
}

export interface Phase {
  code: string
  name: string
  weeks: number
}

export interface Filters {
  batch: string
  phase: string
  rotation: string
  student: string
  startDate: string
  endDate: string
}

export interface WeekInfo {
  weekNumber: number
  dateRange: string
  rotation: string
  phase: string
  isCurrentWeek: boolean
}

export type ViewType = "dashboard" | "calendar" | "student" | "rotation" | "batch"
