"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowLeft, Home } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-2xl border border-white/20 bg-white/60 p-8 shadow-xl backdrop-blur-md">
        {/* Logo/Image Container */}
        <div className="relative aspect-square w-64 select-none">
          <Image
            src="/404.png"
            alt="404 - Not Found"
            fill
            priority
            className="object-contain drop-shadow-lg"
          />
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-[#3D3C3A]">
            Oops!
          </h1>
          <h2 className="text-xl font-semibold text-[#5C554E]">
            We lost this track
          </h2>
          <p className="text-sm leading-relaxed text-[#8B7E74]">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex w-full flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            className="w-full rounded-full border-[#8B7E74] text-[#8B7E74] hover:bg-[#8B7E74]/10 transition-transform duration-200 hover:-translate-y-0.5"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 size-4" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  )
}
