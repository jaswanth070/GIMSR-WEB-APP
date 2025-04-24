"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Download, HelpCircle } from "lucide-react"
import { useSchedulerStore } from "@/lib/store"

interface HeaderProps {
  onShowDocumentation: () => void
}

export function Header({ onShowDocumentation }: HeaderProps) {
  const { prepareAndExportToCSV } = useSchedulerStore()

  return (
    <header className="bg-gradient-to-r from-primary-800 to-primary-950 text-white shadow-lg sticky top-0 z-30">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-3 md:mb-0">
            <div className="mr-3 w-18 h-18 flex items-center justify-center">
              <Image src="https://gimsr.gitam.edu/Images/gimsr-image-ivory.svg" alt="Logo" width={128} height={128} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">COMPULSORY ROTATORY MEDICAL INTERNSHIP</h1>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              className="bg-white text-primary-700 hover:bg-gray-100 shadow-md"
              onClick={onShowDocumentation}
            >
              <HelpCircle className="h-5 w-5 mr-1" />
              Help
            </Button>
            <Button
              variant="outline"
              className="bg-white text-primary-700 hover:bg-gray-100 shadow-md"
              onClick={prepareAndExportToCSV}
            >
              <Download className="h-5 w-5 mr-1" />
              Export Data
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
