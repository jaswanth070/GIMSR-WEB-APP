import { useSchedulerStore } from "@/lib/store"
import type { Dayjs } from "dayjs"

interface CalendarDayProps {
  date: Dayjs
}

export function CalendarDay({ date }: CalendarDayProps) {
  const { isToday, getStudentsForDate, getRotationColorClass, getRotationName } = useSchedulerStore()

  const students = getStudentsForDate(date)
  const today = isToday(date)

  return (
    <div className={`calendar-day border rounded-xl shadow-sm p-4 ${today ? "today" : ""}`}>
      <div className="flex justify-between items-center mb-3 pb-2 border-b">
        <span className="font-bold text-xl">{date.format("D")}</span>
        <span className="text-xs px-2.5 py-1 bg-primary-100 text-primary-800 rounded-full">{date.format("MMM")}</span>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {students.map((student) => {
          // Determine border color based on rotation
          let borderClass = "border-l-blue-500"
          if (
            student.rotation.startsWith("G") ||
            student.rotation.startsWith("P") ||
            student.rotation.startsWith("C") ||
            student.rotation.startsWith("E")
          ) {
            borderClass = "border-l-blue-500"
          } else if (student.rotation.startsWith("A") || student.rotation.startsWith("O")) {
            borderClass = "border-l-green-500"
          } else if (student.rotation.startsWith("R") || student.rotation.startsWith("D")) {
            borderClass = "border-l-purple-500"
          } else if (
            student.rotation.startsWith("Y") ||
            student.rotation.startsWith("F") ||
            student.rotation.startsWith("L")
          ) {
            borderClass = "border-l-yellow-500"
          } else if (
            student.rotation.startsWith("C") ||
            student.rotation.startsWith("P") ||
            student.rotation.startsWith("U") ||
            student.rotation.startsWith("R")
          ) {
            borderClass = "border-l-red-500"
          }

          return (
            <div
              key={student.id}
              className={`text-xs p-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all border border-gray-200 shadow-sm calendar-event ${borderClass}`}
            >
              <div className="font-medium">{student.regdNo}</div>
              <div className="flex justify-between items-center mt-1">
                <span className="truncate">{student.name}</span>
                <div className="tooltip">
                  <span className={`px-1.5 py-0.5 rounded text-xs ${getRotationColorClass(student.rotation)}`}>
                    {student.rotation}
                  </span>
                  <span className="tooltip-text">{getRotationName(student.rotation)}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
