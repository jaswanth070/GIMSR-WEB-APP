"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Calendar, CheckCircle, Layers, RotateCw, ChevronRight, LayoutGrid } from "lucide-react"
import { useSchedulerStore } from "@/lib/store"
import { BatchCard } from "@/components/batch-card"
import { RotationCard } from "@/components/rotation-card"

export function DashboardView() {
  const {
    students,
    getActiveRotationsCount,
    getCurrentWeek,
    getCompletionPercentage,
    getActiveRotations,
    setViewType,
    viewStudentsInRotation,
    getActualStudentCount,
  } = useSchedulerStore()

  // Get the actual student count (non-placeholder students)
  const actualStudentCount = getActualStudentCount()
  const totalStudentCount = 136 // Total capacity (34 per batch)

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-all card-hover border border-gray-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold text-gray-700">Total Students</CardTitle>
            <div className="bg-primary-100 p-2 rounded-lg">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary-600">
              {actualStudentCount}
              <span className="text-lg text-gray-500">/{totalStudentCount}</span>
            </p>
            <div className="mt-2 text-sm text-gray-500 flex items-center">
              <span>Across all batches</span>
              <span className="ml-auto bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">Active</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all card-hover border border-gray-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold text-gray-700">Active Rotations</CardTitle>
            <div className="bg-primary-100 p-2 rounded-lg">
              <RotateCw className="h-6 w-6 text-primary-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary-600">{getActiveRotationsCount()}</p>
            <div className="mt-2 text-sm text-gray-500">Currently in progress</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all card-hover border border-gray-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold text-gray-700">Current Week</CardTitle>
            <div className="bg-primary-100 p-2 rounded-lg">
              <Calendar className="h-6 w-6 text-primary-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary-600">{getCurrentWeek()}</p>
            <div className="mt-2 text-sm text-gray-500">Of 53 total weeks</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all card-hover border border-gray-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold text-gray-700">Completion</CardTitle>
            <div className="bg-primary-100 p-2 rounded-lg">
              <CheckCircle className="h-6 w-6 text-primary-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="mt-2 h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-600 transition-all"
                style={{ width: `${getCompletionPercentage()}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2 font-medium">{getCompletionPercentage()}% Complete</p>
          </CardContent>
        </Card>
      </div>

      {/* Rest of the component remains unchanged */}
      {/* Batch Overview */}
      <Card className="border border-gray-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold text-primary-700 flex items-center">
            <Layers className="h-6 w-6 mr-2" />
            Batch Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {["A", "B", "C", "D"].map((batch) => (
              <BatchCard key={batch} batch={batch} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Rotations */}
      <Card className="border border-gray-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold text-primary-700 flex items-center">
            <RotateCw className="h-6 w-6 mr-2" />
            Current Rotations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getActiveRotations()
              .slice(0, 6)
              .map((rotation) => (
                <RotationCard
                  key={rotation.id}
                  rotation={rotation}
                  onViewStudents={() => viewStudentsInRotation(rotation.code)}
                />
              ))}
          </div>

          <div className="mt-6 text-right">
            <Button
              variant="link"
              onClick={() => setViewType("rotation")}
              className="text-primary-600 hover:text-primary-800 transition flex items-center ml-auto"
            >
              View all rotations
              <ChevronRight className="h-5 w-5 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Access */}
      <Card className="border border-gray-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold text-primary-700 flex items-center">
            <LayoutGrid className="h-6 w-6 mr-2" />
            Quick Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              onClick={() => setViewType("calendar")}
              className="border border-gray-200 rounded-xl p-5 hover:border-primary-500 transition-all cursor-pointer card-hover"
            >
              <div className="flex items-center mb-3">
                <div className="bg-primary-100 p-2.5 rounded-lg mr-3">
                  <Calendar className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold">Calendar View</h3>
              </div>
              <p className="text-gray-600">View weekly rotation schedule for all students</p>
            </div>

            <div
              onClick={() => setViewType("student")}
              className="border border-gray-200 rounded-xl p-5 hover:border-primary-500 transition-all cursor-pointer card-hover"
            >
              <div className="flex items-center mb-3">
                <div className="bg-primary-100 p-2.5 rounded-lg mr-3">
                  <Users className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold">Student View</h3>
              </div>
              <p className="text-gray-600">View current and upcoming rotations for each student</p>
            </div>

            <div
              onClick={() => setViewType("batch")}
              className="border border-gray-200 rounded-xl p-5 hover:border-primary-500 transition-all cursor-pointer card-hover"
            >
              <div className="flex items-center mb-3">
                <div className="bg-primary-100 p-2.5 rounded-lg mr-3">
                  <Layers className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold">Batch View</h3>
              </div>
              <p className="text-gray-600">View phase information for each batch</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
