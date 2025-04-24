"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useSchedulerStore } from "@/lib/store"
import { Calendar, Printer } from "lucide-react"
import { useState } from "react"

export function FullScheduleModal() {
  const {
    showFullScheduleModal,
    closeFullScheduleModal,
    selectedStudentId,
    getFullScheduleByPhase,
    getStudentName,
    getRotationName,
    getRotationColorClass,
  } = useSchedulerStore()
  const [isPrinting, setIsPrinting] = useState(false)

  const scheduleByPhase = getFullScheduleByPhase(selectedStudentId)
  const studentName = getStudentName(selectedStudentId)

  const handlePrintSchedule = () => {
    setIsPrinting(true)

    // Create a new window for printing
    const printWindow = window.open("", "_blank")
    if (!printWindow) {
      alert("Please allow pop-ups to print the schedule")
      setIsPrinting(false)
      return
    }

    // Generate the print content
    const printContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Schedule for ${studentName}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          h1 {
            color: #0f766e;
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #0f766e;
          }
          h2 {
            color: #0f766e;
            margin-top: 30px;
            padding-bottom: 5px;
            border-bottom: 1px solid #ddd;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          th, td {
            padding: 8px 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          th {
            background-color: #f9fafb;
            font-weight: bold;
          }
          .current-week {
            background-color: #ccfbf1;
          }
          .phase-M { border-left: 5px solid #3b82f6; }
          .phase-S { border-left: 5px solid #10b981; }
          .phase-O { border-left: 5px solid #8b5cf6; }
          .phase-Misc { border-left: 5px solid #f59e0b; }
          .phase-CM { border-left: 5px solid #ef4444; }
          
          .badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
          }
          
          .badge-M { background-color: #dbeafe; color: #1e40af; }
          .badge-S { background-color: #d1fae5; color: #065f46; }
          .badge-O { background-color: #ede9fe; color: #5b21b6; }
          .badge-Misc { background-color: #fef3c7; color: #92400e; }
          .badge-CM { background-color: #fee2e2; color: #b91c1c; }
          
          .footer {
            text-align: center;
            margin-top: 40px;
            font-size: 12px;
            color: #6b7280;
          }
          
          @media print {
            body { 
              padding: 0;
              margin: 0;
            }
            h1 { margin-top: 0; }
          }
        </style>
      </head>
      <body>
        <h1>Medical Rotation Schedule for ${studentName}</h1>
        
        ${Object.entries(scheduleByPhase)
          .map(([phase, weeks]) => {
            const phaseName = (() => {
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
            })()

            return `
            <div class="phase-${phase}">
              <h2>${phaseName} Phase</h2>
              <table>
                <thead>
                  <tr>
                    <th>Week</th>
                    <th>Date Range</th>
                    <th>Rotation</th>
                    <th>Rotation Name</th>
                  </tr>
                </thead>
                <tbody>
                  ${weeks
                    .map(
                      (week) => `
                    <tr class="${week.isCurrentWeek ? "current-week" : ""}">
                      <td>${week.weekNumber}</td>
                      <td>${week.dateRange}</td>
                      <td>
                        <span class="badge badge-${phase}">${week.rotation}</span>
                      </td>
                      <td>${getRotationName(week.rotation)}</td>
                    </tr>
                  `,
                    )
                    .join("")}
                </tbody>
              </table>
            </div>
          `
          })
          .join("")}
        
        <div class="footer">
          <p>Generated on ${new Date().toLocaleDateString()} by Medical Rotation Scheduler</p>
        </div>
      </body>
      </html>
    `

    // Write to the new window and print
    printWindow.document.open()
    printWindow.document.write(printContent)
    printWindow.document.close()

    // Wait for content to load before printing
    printWindow.onload = () => {
      printWindow.print()
      setIsPrinting(false)
    }
  }

  if (!showFullScheduleModal) return null

  return (
    <Dialog open={showFullScheduleModal} onOpenChange={closeFullScheduleModal}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center justify-between">
            <span className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Full Schedule for {studentName}
            </span>
            <Button
              onClick={handlePrintSchedule}
              disabled={isPrinting}
              className="flash-hover-effect"
              variant="outline"
              size="sm"
            >
              <Printer className="h-4 w-4 mr-2" />
              {isPrinting ? "Preparing..." : "Print Schedule"}
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {Object.entries(scheduleByPhase).map(([phase, weeks]) => (
            <div key={phase} className={`phase-group phase-group-${phase}`}>
              <h3 className="text-lg font-semibold mb-3">
                {phase === "MED" && "Medicine Phase"}
                {phase === "SUR" && "Surgery Phase"}
                {phase === "OBG" && "OBGY Phase"}
                {phase === "OTH" && "Others Phase"}
                {phase === "COM" && "Community Medicine Phase"}
                {!["MED", "SUR", "OBG", "OTH", "COM"].includes(phase) && `${phase} Phase`}
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Week</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Date Range</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Rotation</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Rotation Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weeks.map((week) => (
                      <tr
                        key={week.weekNumber}
                        className={`border-b border-gray-100 ${week.isCurrentWeek ? "bg-primary-50" : ""}`}
                      >
                        <td className="px-4 py-3">{week.weekNumber}</td>
                        <td className="px-4 py-3">{week.dateRange}</td>
                        <td className="px-4 py-3">
                          <div
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium inline-block ${getRotationColorClass(week.rotation)}`}
                          >
                            {week.rotation}
                          </div>
                        </td>
                        <td className="px-4 py-3">{getRotationName(week.rotation)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
