import Image from "next/image"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-gradient-to-r from-primary-800 to-primary-950 text-white py-8 mt-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="mr-3 w-18 h-18 flex items-center justify-center">
              <Image src="https://gimsr.gitam.edu/Images/gimsr-image-ivory.svg" alt="Logo" width={128} height={128} />
            </div>
            <div>
              <h2 className="text-lg font-bold">CRMI - GIMSR</h2>
              <p className="text-xs text-primary-100">© {new Date().getFullYear()} All Rights Reserved</p>
            </div>
          </div>
          <div className="text-center md:text-right">
            <p className="text-sm">
              Developed and managed by{" "}
              <Link href="https://jaswanthmadiya.tech" target="_blank" className="font-bold hover:underline">
                Madiya Jaswanth
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
