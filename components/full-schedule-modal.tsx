"use client"

import { Button } from "@/components/ui/button"
import { X, Download, Printer } from "lucide-react"
import { useSchedulerStore } from "@/lib/store"

export function FullScheduleModal() {
  const {
    selectedStudentId,
    getStudentName,
    getFullScheduleByPhase,
    getPhaseName,
    getRotationColorClass,
    getRotationName,
    exportStudentScheduleToCSV,
    closeFullScheduleModal,
  } = useSchedulerStore()

  const phaseGroups = getFullScheduleByPhase(selectedStudentId)

  // Add print functionality
  const handlePrintSchedule = () => {
    // Create a new window for printing
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    // Get student name
    const studentName = getStudentName(selectedStudentId)

    // Create print-friendly HTML content
    let printContent = `
      <html>
        <head>
          <title>Schedule for ${studentName}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #333;
            }
            h1 {
              text-align: center;
              color: #2563eb;
              margin-bottom: 20px;
            }
            .phase-header {
              margin-top: 30px;
              margin-bottom: 10px;
              font-size: 18px;
              font-weight: bold;
              display: flex;
              align-items: center;
            }
            .phase-indicator {
              width: 12px;
              height: 12px;
              border-radius: 50%;
              display: inline-block;
              margin-right: 8px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            th {
              background-color: #f3f4f6;
              padding: 10px;
              text-align: left;
              font-weight: bold;
              border-bottom: 1px solid #ddd;
            }
            td {
              padding: 10px;
              border-bottom: 1px solid #ddd;
            }
            .rotation-badge {
              display: inline-block;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: bold;
            }
            .current-week {
              background-color: #f0f9ff;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              font-size: 12px;
              color: #666;
            }
            @media print {
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <h1>Full Schedule for ${studentName}</h1>
    `

    // Add each phase group to the print content
    Object.entries(phaseGroups).forEach(([phaseCode, phaseGroup]) => {
      let phaseColor = "#2563eb" // Default blue
      if (phaseCode === "M")
        phaseColor = "#3b82f6" // blue
      else if (phaseCode === "S")
        phaseColor = "#10b981" // green
      else if (phaseCode === "O")
        phaseColor = "#8b5cf6" // purple
      else if (phaseCode === "Misc")
        phaseColor = "#f59e0b" // yellow
      else if (phaseCode === "CM") phaseColor = "#ef4444" // red

      printContent += `
        <div class="phase-header">
          <span class="phase-indicator" style="background-color: ${phaseColor};"></span>
          <span>${getPhaseName(phaseCode)}</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Week</th>
              <th>Date Range</th>
              <th>Rotation</th>
              <th>Sub-Phase</th>
            </tr>
          </thead>
          <tbody>
      `

      phaseGroup.forEach((week) => {
        let rotationColor = "#e5e7eb" // Default gray
        if (phaseCode === "M")
          rotationColor = "#dbeafe" // light blue
        else if (phaseCode === "S")
          rotationColor = "#d1fae5" // light green
        else if (phaseCode === "O")
          rotationColor = "#ede9fe" // light purple
        else if (phaseCode === "Misc")
          rotationColor = "#fef3c7" // light yellow
        else if (phaseCode === "CM") rotationColor = "#fee2e2" // light red

        printContent += `
          <tr class="${week.isCurrentWeek ? "current-week" : ""}">
            <td>${week.weekNumber}</td>
            <td>${week.dateRange}</td>
            <td>
              <span class="rotation-badge" style="background-color: ${rotationColor}; color: #333;">
                ${week.rotation}
              </span>
            </td>
            <td>${getRotationName(week.rotation)}</td>
          </tr>
        `
      })

      printContent += `
          </tbody>
        </table>
      `
    })

    // Add footer and close HTML
    printContent += `
          <div class="footer">
            Generated on ${new Date().toLocaleDateString()} | Medical Rotation Scheduler
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
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-40 overflow-auto p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in-50 zoom-in-95 duration-300">
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <span>{`Full Schedule for ${getStudentName(selectedStudentId)}`}</span>
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeFullScheduleModal}
            className="text-white hover:text-gray-200 hover:bg-white/10 rounded-full"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="p-6 overflow-auto flex-grow">
          <div className="overflow-x-auto">
            {Object.entries(phaseGroups).map(([phaseCode, phaseGroup]) => {
              // Determine phase color
              let phaseColorClass = "phase-group-M"
              if (phaseCode === "M") phaseColorClass = "phase-group-M"
              else if (phaseCode === "S") phaseColorClass = "phase-group-S"
              else if (phaseCode === "O") phaseColorClass = "phase-group-O"
              else if (phaseCode === "Misc") phaseColorClass = "phase-group-Misc"
              else if (phaseCode === "CM") phaseColorClass = "phase-group-CM"

              return (
                <div key={phaseCode} className={`mb-8 phase-group ${phaseColorClass} pl-4`}>
                  <h3 className="text-lg font-bold mb-3 flex items-center">
                    <span
                      className={`w-3 h-3 rounded-full mr-2 ${
                        phaseCode === "M"
                          ? "bg-blue-500"
                          : phaseCode === "S"
                            ? "bg-green-500"
                            : phaseCode === "O"
                              ? "bg-purple-500"
                              : phaseCode === "Misc"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                      }`}
                    ></span>
                    <span>{getPhaseName(phaseCode)}</span>
                  </h3>

                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <table className="min-w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50 text-left">
                          <th className="px-4 py-3 text-sm font-medium text-gray-600">Week</th>
                          <th className="px-4 py-3 text-sm font-medium text-gray-600">Date Range</th>
                          <th className="px-4 py-3 text-sm font-medium text-gray-600">Rotation</th>
                          <th className="px-4 py-3 text-sm font-medium text-gray-600">Sub-Phase</th>
                        </tr>
                      </thead>
                      <tbody>
                        {phaseGroup.map((week, index) => (
                          <tr key={index} className={week.isCurrentWeek ? "bg-primary-50" : "table-row-hover"}>
                            <td className="px-4 py-3 font-medium border-b border-gray-100">{week.weekNumber}</td>
                            <td className="px-4 py-3 border-b border-gray-100">{week.dateRange}</td>
                            <td className="px-4 py-3 border-b border-gray-100">
                              <div className="tooltip">
                                <div
                                  className={`px-2 py-1 rounded-md text-xs font-medium inline-block badge ${getRotationColorClass(week.rotation)}`}
                                >
                                  {week.rotation}
                                </div>
                                <span className="tooltip-text">{getRotationName(week.rotation)}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 border-b border-gray-100">{getRotationName(week.rotation)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end bg-gray-50">
          <Button onClick={handlePrintSchedule} className="bg-indigo-600 hover:bg-indigo-700 mr-3">
            <Printer className="h-5 w-5 mr-2" />
            Print Schedule
          </Button>
          <Button
            onClick={() => exportStudentScheduleToCSV(selectedStudentId)}
            className="bg-primary-600 hover:bg-primary-700 mr-3"
          >
            <Download className="h-5 w-5 mr-2" />
            Export to CSV
          </Button>
          <Button variant="outline" onClick={closeFullScheduleModal}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
