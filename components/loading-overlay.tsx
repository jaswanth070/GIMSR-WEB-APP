import { useSchedulerStore } from "@/lib/store"

export function LoadingOverlay() {
  const { loadingMessage, loadingSubMessage } = useSchedulerStore()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-xl shadow-2xl flex flex-col items-center max-w-md w-full transform transition-all">
        <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-14 w-14 mb-5"></div>
        <h2 className="text-2xl font-bold text-primary-700 mb-3">{loadingMessage}</h2>
        <p className="text-gray-600 text-center">{loadingSubMessage}</p>
        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-6">
          <div className="bg-primary-600 h-1.5 rounded-full animate-pulse-slow" style={{ width: "100%" }}></div>
        </div>
      </div>
    </div>
  )
}
