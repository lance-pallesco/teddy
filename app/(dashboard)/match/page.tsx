import { Suspense } from "react"
import { MatchWizard } from "@/app/(dashboard)/match/match-wizard"

export default function FindMyMatchPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={
        <div className="max-w-md mx-auto py-16 px-4 text-center space-y-6">
          <div className="relative size-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-[#AE8F65]/20 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-base text-gray-900">Loading Wizard...</h3>
          </div>
        </div>
      }>
        <MatchWizard />
      </Suspense>
    </div>
  )
}
