"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { FilterPanel } from "@/components/filter-panel"
import { ViewSelector } from "@/components/view-selector"
import { DashboardView } from "@/components/dashboard-view"
import { CalendarView } from "@/components/calendar-view"
import { StudentView } from "@/components/student-view"
import { RotationView } from "@/components/rotation-view"
import { BatchView } from "@/components/batch-view"
import { TimelineView } from "@/components/timeline-view"
import { FullScheduleModal } from "@/components/full-schedule-modal"
import { SubPhaseStudentsModal } from "@/components/sub-phase-students-modal"
import { ExportLoadingModal } from "@/components/export-loading-modal"
import { LoadingOverlay } from "@/components/loading-overlay"
import { DocumentationModal } from "@/components/documentation-modal"
import { useSchedulerStore } from "@/lib/store"
import { useToast } from "@/components/ui/use-toast"

export default function Home() {
  const [showDocumentation, setShowDocumentation] = useState(false)
  const { toast } = useToast()

  const { initialize, loading, viewType, showFullScheduleModal, showSubPhaseStudentsModal, showExportLoadingModal } =
    useSchedulerStore()

  useEffect(() => {
    // Check if it's the first visit
    const isFirstVisit = localStorage.getItem("visited") !== "true"
    if (isFirstVisit) {
      // Show documentation modal on first visit
      setTimeout(() => {
        setShowDocumentation(true)
        localStorage.setItem("visited", "true")
      }, 1000)
    }

    // Initialize the scheduler
    initialize()
      .then(() => {
        toast({
          title: "Ready to use",
          description: "Medical Rotation Scheduler has been initialized successfully.",
          duration: 3000,
        })
      })
      .catch((error) => {
        console.error("Initialization error:", error)
        toast({
          title: "Initialization Error",
          description: "There was a problem loading the scheduler data.",
          variant: "destructive",
          duration: 5000,
        })
      })
  }, [initialize, toast])

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Loading Overlay */}
      {loading && <LoadingOverlay />}

      {/* Documentation Modal */}
      <DocumentationModal isOpen={showDocumentation} onClose={() => setShowDocumentation(false)} />

      {/* Full Schedule Modal */}
      {showFullScheduleModal && <FullScheduleModal />}

      {/* Sub-Phase Students Modal */}
      {showSubPhaseStudentsModal && <SubPhaseStudentsModal />}

      {/* Export Loading Modal */}
      {showExportLoadingModal && <ExportLoadingModal />}

      {/* Header */}
      <Header onShowDocumentation={() => setShowDocumentation(true)} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 flex-grow">
        <FilterPanel />
        <ViewSelector />

        {viewType === "dashboard" && <DashboardView />}
        {viewType === "calendar" && <CalendarView />}
        {viewType === "student" && <StudentView />}
        {viewType === "rotation" && <RotationView />}
        {viewType === "batch" && <BatchView />}
        {viewType === "timeline" && <TimelineView />}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
