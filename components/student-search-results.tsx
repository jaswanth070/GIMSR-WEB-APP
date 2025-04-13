"use client"

import type { Student } from "@/lib/types"

interface StudentSearchResultsProps {
  results: Student[]
  query: string
  onSelect: (studentId: string) => void
}

export function StudentSearchResults({ results, query, onSelect }: StudentSearchResultsProps) {
  if (results.length === 0 || query.length === 0) {
    return null
  }

  return (
    <div className="absolute z-10 w-full mt-1 bg-white shadow-xl rounded-lg max-h-60 overflow-auto border border-gray-100">
      {results.map((student) => (
        <div
          key={student.id}
          onClick={() => onSelect(student.id)}
          className="px-4 py-3 hover:bg-primary-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
        >
          <div className="font-medium">{student.regdNo}</div>
          <div className="text-sm text-gray-600">{student.name}</div>
        </div>
      ))}
    </div>
  )
}
