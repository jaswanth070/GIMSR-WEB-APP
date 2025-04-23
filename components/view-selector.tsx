"use client"

import { Button } from "@/components/ui/button"
import { LayoutGrid, Calendar, Users, LayoutList, Layers, TimerIcon as Timeline } from "lucide-react"
import { useSchedulerStore } from "@/lib/store"
import { cn } from "@/lib/utils"

export function ViewSelector() {
  const { viewType, setViewType } = useSchedulerStore()

  const views = [
    { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "student", label: "Students", icon: Users },
    { id: "rotation", label: "Rotations", icon: LayoutList },
    { id: "batch", label: "Batches", icon: Layers },
    { id: "timeline", label: "Timeline", icon: Timeline },
  ]

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <div className="flex flex-wrap gap-3">
        {views.map((view) => {
          const Icon = view.icon
          const isActive = viewType === view.id

          return (
            <Button
              key={view.id}
              variant={isActive ? "default" : "secondary"}
              className={cn(
                "transition",
                isActive ? "bg-primary-600 text-white shadow-md" : "bg-gray-100 text-gray-700 hover:bg-gray-200",
              )}
              onClick={() => setViewType(view.id)}
            >
              <Icon className="h-5 w-5 mr-1.5" />
              {view.label}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
