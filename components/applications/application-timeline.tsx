import type { AdoptionStatus } from "@prisma/client"
import { FileText, Search, MessageSquare, CheckCircle, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

type ApplicationTimelineProps = {
  applicationStatus: AdoptionStatus
  createdAt: Date
  submittedAt: Date | null
  reviewedAt: Date | null
  chatMode?: string | null
}

export function ApplicationTimeline({
  applicationStatus,
  createdAt,
  submittedAt,
  reviewedAt,
  chatMode,
}: ApplicationTimelineProps) {
  const isRejected = applicationStatus === "REJECTED"
  const isWithdrawn = applicationStatus === "WITHDRAWN"
  const isTerminated = isRejected || isWithdrawn

  // 3-step timeline check: application is rejected and never reached interview stage (chatMode is null)
  const isThreeStep = isRejected && !chatMode

  let activeStep = 0
  let steps = []

  if (isThreeStep) {
    // 3 steps: Submitted, Screening, Rejected
    activeStep = 2
    steps = [
      { label: "Submitted", desc: "Form received", icon: FileText },
      { label: "Screening", desc: "Background check", icon: Search },
      {
        label: "Rejected",
        desc: "Adoption declined",
        icon: X,
      },
    ]
  } else {
    // 4 steps: Submitted, Screening, Interview, Approved/Rejected/Withdrawn
    if (applicationStatus === "UNDER_REVIEW") activeStep = 1
    if (applicationStatus === "INTERVIEW_IN_PROGRESS") activeStep = 2
    if (applicationStatus === "APPROVED" || isTerminated) activeStep = 3

    steps = [
      { label: "Submitted", desc: "Form received", icon: FileText },
      { label: "Screening", desc: "Background check", icon: Search },
      { label: "Interview", desc: "Interactive chat", icon: MessageSquare },
      {
        label: isRejected ? "Rejected" : isWithdrawn ? "Withdrawn" : "Approved",
        desc: isRejected ? "Adoption declined" : isWithdrawn ? "Cancelled" : "Ready for adoption",
        icon: isTerminated ? X : CheckCircle,
      },
    ]
  }

  const totalSteps = steps.length - 1
  const cellWidthClass = isThreeStep ? "w-1/3" : "w-1/4"
  const trackLeft = isThreeStep ? "16.67%" : "12.5%"
  const trackRight = isThreeStep ? "16.67%" : "12.5%"
  const progressMultiplier = isThreeStep ? 66.67 : 75

  return (
    <div className="flex items-center w-full relative py-2">
      {/* Background track line */}
      <div 
        className="absolute top-[26px] sm:top-[30px] h-0.5 bg-muted z-0" 
        style={{ left: trackLeft, right: trackRight }}
      />
      
      {/* Active progress track line */}
      <div
        className="absolute top-[26px] sm:top-[30px] h-0.5 transition-all duration-500 z-0"
        style={{
          left: trackLeft,
          width: `${(activeStep / totalSteps) * progressMultiplier}%`,
          background: isRejected
            ? "linear-gradient(to right, #10b981, #ae8f65, #ef4444)"
            : isWithdrawn
              ? "linear-gradient(to right, #10b981, #ae8f65, #9ca3af)"
              : activeStep === totalSteps
                ? "#10b981"
                : "linear-gradient(to right, #10b981, #ae8f65)"
        }}
      />
      
      {steps.map((step, idx) => {
        const isDone = idx < activeStep
        const isCurrent = idx === activeStep
        const StepIcon = step.icon

        // Determine step-specific color schemas
        let circleStyle = ""
        let textStyle = ""

        const isLastStep = idx === totalSteps

        if (isLastStep && isTerminated) {
          circleStyle = isRejected
            ? "bg-red-500 border-red-500 text-white scale-110 shadow-md ring-4 ring-red-500/10"
            : "bg-muted border-border text-muted-foreground scale-110"
          textStyle = isRejected ? "text-red-500" : "text-muted-foreground"
        } else if (isCurrent) {
          circleStyle = "bg-[#AE8F65] border-[#AE8F65] text-white scale-110 shadow-md ring-4 ring-[#AE8F65]/10"
          textStyle = "text-[#AE8F65]"
        } else if (isDone) {
          circleStyle = "bg-emerald-500 border-emerald-500 text-white"
          textStyle = "text-emerald-600"
        } else {
          circleStyle = "bg-white border-border text-muted-foreground"
          textStyle = "text-muted-foreground"
        }

        return (
          <div key={step.label} className={cn(cellWidthClass, "flex flex-col items-center text-center space-y-1")}>
            <div
              className={cn(
                "size-9 sm:size-11 rounded-full flex items-center justify-center border-2 transition-all duration-300 relative z-10",
                circleStyle
              )}
            >
              {isLastStep && isTerminated ? (
                <X className="size-4 sm:size-5 stroke-[2.5]" />
              ) : isDone ? (
                <Check className="size-4 sm:size-5 stroke-[2.5]" />
              ) : (
                <StepIcon className="size-4 sm:size-5" />
              )}
            </div>
            <div className="space-y-0.5">
              <p className={cn("text-[10px] sm:text-xs font-bold leading-tight", textStyle)}>
                {step.label}
              </p>
              <p className="hidden sm:block text-[9px] text-muted-foreground/80 leading-none">
                {step.desc}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
