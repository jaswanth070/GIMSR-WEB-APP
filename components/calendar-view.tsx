"use client"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useSchedulerStore } from "@/lib/store"
import { CalendarDay } from "@/components/calendar-day"
import { WeeklyRotationSummary } from "@/components/weekly-rotation-summary"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"

export function CalendarView() {
  const {
    calendarLoading,
    currentViewStartDate,
    currentViewEndDate,
    previousWeek,
    nextWeek,
    formatDateRange,
    getCurrentWeekDates,
  } = useSchedulerStore()

  return (
    <Card className="mb-6 border border-gray-100">
      <CardHeader className="pb-2">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle className="text-xl font-semibold text-primary-700 flex items-center">
            <BarChart className="h-6 w-6 mr-2" />
            Schedule Visualization
          </CardTitle>

          <div className="flex space-x-2 items-center">
            <Button variant="outline" size="sm" onClick={previousWeek} className="flex items-center">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <span className="px-4 py-2 bg-primary-50 rounded-lg border border-primary-100 font-medium">
              {formatDateRange(currentViewStartDate, currentViewEndDate)}
            </span>

            <Button variant="outline" size="sm" onClick={nextWeek} className="flex items-center">
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {calendarLoading ? (
          <div className="flex justify-center items-center py-16">
            <LoadingSpinner message="Loading calendar data..." />
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in-50 duration-300">
            <div className="mb-6">
              <div className="grid grid-cols-7 gap-3">
                {/* Calendar Headers */}
                <div className="calendar-header p-3 text-center rounded-t-md font-semibold">Sun</div>
                <div className="calendar-header p-3 text-center font-semibold">Mon</div>
                <div className="calendar-header p-3 text-center font-semibold">Tue</div>
                <div className="calendar-header p-3 text-center font-semibold">Wed</div>
                <div className="calendar-header p-3 text-center font-semibold">Thu</div>
                <div className="calendar-header p-3 text-center font-semibold">Fri</div>
                <div className="calendar-header p-3 text-center rounded-t-md font-semibold">Sat</div>

                {/* Calendar Days */}
                {getCurrentWeekDates().map((date) => (
                  <CalendarDay key={date.format("YYYY-MM-DD")} date={date} />
                ))}
              </div>
            </div>

            {/* Weekly Rotation Summary */}
            <WeeklyRotationSummary />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
