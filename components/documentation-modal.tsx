"use client"

import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface DocumentationModalProps {
  isOpen: boolean
  onClose: () => void
}

export function DocumentationModal({ isOpen, onClose }: DocumentationModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 overflow-auto p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in-50 zoom-in-95 duration-300">
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>Medical Rotation Scheduler Documentation</span>
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:text-gray-200 hover:bg-white/10 rounded-full"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="p-6 overflow-auto flex-grow">
          <Tabs defaultValue="overview">
            <TabsList className="grid grid-cols-5 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="calendar">Calendar View</TabsTrigger>
              <TabsTrigger value="students">Student Management</TabsTrigger>
              <TabsTrigger value="rotations">Rotations & Batches</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Welcome to the Medical Rotation Scheduler</CardTitle>
                  <CardDescription>A comprehensive system for managing medical student rotations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    The Medical Rotation Scheduler is designed to streamline the management of medical student rotations
                    across different departments and phases. This application helps administrators, faculty, and
                    students track and manage rotation schedules efficiently.
                  </p>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Key Features:</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Dashboard with key statistics and overview</li>
                      <li>Calendar view for visualizing weekly rotations</li>
                      <li>Student management with detailed rotation schedules</li>
                      <li>Rotation tracking across departments</li>
                      <li>Batch management for group scheduling</li>
                      <li>Export functionality for reports and data sharing</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Getting Started:</h3>
                    <p>
                      Use the navigation buttons at the top of the application to switch between different views. The
                      filter panel allows you to narrow down the displayed information based on various criteria such as
                      batch, phase, rotation, and date range.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="dashboard" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Dashboard Overview</CardTitle>
                  <CardDescription>Central hub for monitoring rotation statistics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    The dashboard provides a comprehensive overview of the current state of medical rotations, including
                    key statistics, batch information, and active rotations.
                  </p>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Dashboard Components:</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>
                        <strong>Statistics Cards:</strong> Shows total students, active rotations, current week, and
                        completion percentage
                      </li>
                      <li>
                        <strong>Batch Overview:</strong> Displays current phase information for each batch
                      </li>
                      <li>
                        <strong>Current Rotations:</strong> Lists active rotations with student counts
                      </li>
                      <li>
                        <strong>Quick Access:</strong> Provides shortcuts to other views
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Tips:</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>
                        Click on "View Students" in the rotation cards to see which students are currently in that
                        rotation
                      </li>
                      <li>Use the "View all rotations" link to see a complete list of rotations</li>
                      <li>Click on any of the Quick Access cards to navigate directly to that view</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="calendar" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Calendar View</CardTitle>
                  <CardDescription>Weekly visualization of student rotations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    The Calendar View provides a weekly visualization of student rotations, allowing you to see which
                    students are assigned to which rotations on specific days.
                  </p>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Using the Calendar:</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>
                        <strong>Navigation:</strong> Use the Previous and Next buttons to navigate between weeks
                      </li>
                      <li>
                        <strong>Current Day:</strong> The current day is highlighted with a special border
                      </li>
                      <li>
                        <strong>Student Cards:</strong> Each student assignment is shown as a card with rotation
                        information
                      </li>
                      <li>
                        <strong>Weekly Summary:</strong> Below the calendar is a table summarizing all rotations for the
                        week
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Tips:</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Hover over rotation codes to see the full rotation name</li>
                      <li>Use the filters at the top to narrow down the displayed students</li>
                      <li>Click "View Full Schedule" for any student to see their complete rotation schedule</li>
                      <li>Set a specific date using the date picker in the filter panel</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="students" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Student Management</CardTitle>
                  <CardDescription>Track and manage individual student rotations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    The Student View allows you to see detailed information about each student's current and upcoming
                    rotations, making it easy to track individual progress and schedules.
                  </p>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Student Information:</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>
                        <strong>Student List:</strong> Shows all students with their registration numbers and batch
                        information
                      </li>
                      <li>
                        <strong>Current Rotation:</strong> Displays the rotation each student is currently assigned to
                      </li>
                      <li>
                        <strong>Date Range:</strong> Shows the start and end dates for the current rotation
                      </li>
                      <li>
                        <strong>Next Rotation:</strong> Indicates the upcoming rotation for each student
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Actions:</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Use the search box to quickly find specific students by name or registration number</li>
                      <li>Click "View Full Schedule" to see a student's complete rotation schedule</li>
                      <li>Use the filters to narrow down the list by batch, phase, or rotation</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rotations" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Rotations & Batches</CardTitle>
                  <CardDescription>Manage rotations and batch assignments</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    The Rotation and Batch views allow you to manage and monitor rotations across different departments
                    and track batch progress through various phases.
                  </p>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Rotation View:</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>
                        <strong>Rotation List:</strong> Shows all rotations with their codes, names, and phases
                      </li>
                      <li>
                        <strong>Current Students:</strong> Displays students currently assigned to each rotation
                      </li>
                      <li>
                        <strong>Date Range:</strong> Shows the start and end dates for each rotation
                      </li>
                      <li>
                        <strong>Actions:</strong> Click "View Students" to see all students in a specific rotation
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Batch View:</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>
                        <strong>Batch List:</strong> Shows all batches with their current phase information
                      </li>
                      <li>
                        <strong>Student Count:</strong> Displays the number of students in each batch
                      </li>
                      <li>
                        <strong>Date Range:</strong> Shows the start and end dates for the current phase
                      </li>
                      <li>
                        <strong>Next Phase:</strong> Indicates the upcoming phase for each batch
                      </li>
                      <li>
                        <strong>Actions:</strong> Click "View Students" to see all students in a specific batch
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end bg-gray-50">
          <Button onClick={onClose}>Close Documentation</Button>
        </div>
      </div>
    </div>
  )
}
