"use client"

import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { useSchedulerStore } from "@/lib/store"
import type { Rotation } from "@/lib/types"

interface RotationCardProps {
  rotation: Rotation
  onViewStudents: () => void
}

export function RotationCard({ rotation, onViewStudents }: RotationCardProps) {
  const { getRotationColorClass, formatDate } = useSchedulerStore()

  return (
    <div className="border border-gray-200 rounded-xl p-5 hover:border-primary-500 transition-all shadow-hover">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <div
            className={`px-2.5 py-1 rounded-lg text-xs font-medium inline-block mr-2 ${getRotationColorClass(rotation.code)}`}
          >
            {rotation.code}
          </div>
          <span className="font-medium">{rotation.name}</span>
        </div>
        <span className="bg-gray-200 text-gray-800 text-xs px-2.5 py-1 rounded-full">{rotation.studentCount}</span>
      </div>
      <div className="mb-3 p-3 bg-gray-50 rounded-lg">
        <span className="text-sm text-gray-500">Phase:</span>
        <span className="font-medium ml-1">{rotation.phase}</span>
      </div>
      <div className="text-sm text-gray-500 mb-4">
        <span>{formatDate(rotation.startDate)}</span> -<span>{formatDate(rotation.endDate)}</span>
      </div>
      <div>
        <Button
          onClick={onViewStudents}
          className="bg-primary-600 hover:bg-primary-700 w-full justify-center"
          size="sm"
        >
          <Eye className="h-4 w-4 mr-1.5" />
          View Students
        </Button>
      </div>
    </div>
  )
}
