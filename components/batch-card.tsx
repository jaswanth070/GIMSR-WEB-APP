import { useSchedulerStore } from "@/lib/store"

interface BatchCardProps {
  batch: string
}

export function BatchCard({ batch }: BatchCardProps) {
  const { getStudentCountInBatch, getCurrentPhaseForBatch, getNextPhaseForBatch, formatDate } = useSchedulerStore()

  const currentPhase = getCurrentPhaseForBatch(batch)
  const nextPhase = getNextPhaseForBatch(batch)

  return (
    <div className="border border-gray-200 rounded-xl p-5 hover:border-primary-500 transition-all shadow-hover">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold flex items-center">
          <span
            className={`w-3 h-3 rounded-full mr-2 ${
              batch === "A"
                ? "bg-blue-500"
                : batch === "B"
                  ? "bg-green-500"
                  : batch === "C"
                    ? "bg-purple-500"
                    : "bg-yellow-500"
            }`}
          ></span>
          <span>{`Batch ${batch}`}</span>
        </h3>
        <span className="bg-primary-600 text-white text-xs px-2.5 py-1 rounded-full">
          {getStudentCountInBatch(batch)}
        </span>
      </div>
      <div className="mb-3 p-3 bg-gray-50 rounded-lg">
        <span className="text-sm text-gray-500">Current Phase:</span>
        <div className="font-medium text-lg">{currentPhase.phase}</div>
      </div>
      <div className="mb-3">
        <span className="text-sm text-gray-500">Date Range:</span>
        <div className="font-medium">
          <span>{formatDate(currentPhase.startDate)}</span> -<span>{formatDate(currentPhase.endDate)}</span>
        </div>
      </div>
      <div>
        <span className="text-sm text-gray-500">Next Phase:</span>
        <span className="font-medium ml-1">{nextPhase ? nextPhase.phase : "None"}</span>
      </div>
    </div>
  )
}
