import type { AdoptionStatus } from "@prisma/client"
import { CheckCircle2Icon, CircleIcon, CircleDotIcon, XCircleIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type TimelineStep = {
  label: string
  timestamp: Date | null
  status: "completed" | "current" | "upcoming" | "rejected"
}

type ApplicationTimelineProps = {
  applicationStatus: AdoptionStatus
  createdAt: Date
  submittedAt: Date | null
  reviewedAt: Date | null
}

function formatTimestamp(date: Date | null): string {
  if (!date) return ""
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}

function buildTimelineSteps(
  status: AdoptionStatus,
  createdAt: Date,
  submittedAt: Date | null,
  reviewedAt: Date | null
): TimelineStep[] {
  const steps: TimelineStep[] = []

  // Step 1: Draft created
  const draftCompleted = status !== "DRAFT"
  steps.push({
    label: "Application Created",
    timestamp: createdAt,
    status: draftCompleted ? "completed" : "current",
  })

  // Step 2: Submitted
  const isSubmitted = ["PENDING", "UNDER_REVIEW", "INTERVIEW_IN_PROGRESS", "APPROVED", "REJECTED", "WITHDRAWN"].includes(status)
  steps.push({
    label: "Submitted",
    timestamp: submittedAt,
    status: isSubmitted
      ? status === "PENDING" ? "current" : "completed"
      : status === "WITHDRAWN" ? "completed" : "upcoming",
  })

  // Step 3: Under Review / Interview
  const isUnderReview = ["UNDER_REVIEW", "INTERVIEW_IN_PROGRESS", "APPROVED", "REJECTED"].includes(status)
  steps.push({
    label: status === "INTERVIEW_IN_PROGRESS" ? "Interview" : "Under Review",
    timestamp: isUnderReview ? reviewedAt : null,
    status: isUnderReview
      ? (status === "UNDER_REVIEW" || status === "INTERVIEW_IN_PROGRESS") ? "current" : "completed"
      : "upcoming",
  })

  // Step 4: Decision
  if (status === "REJECTED") {
    steps.push({
      label: "Rejected",
      timestamp: reviewedAt,
      status: "rejected",
    })
  } else if (status === "WITHDRAWN") {
    steps.push({
      label: "Withdrawn",
      timestamp: null,
      status: "rejected",
    })
  } else {
    steps.push({
      label: "Approved",
      timestamp: status === "APPROVED" ? reviewedAt : null,
      status: status === "APPROVED" ? "completed" : "upcoming",
    })
  }

  return steps
}

export function ApplicationTimeline({
  applicationStatus,
  createdAt,
  submittedAt,
  reviewedAt,
}: ApplicationTimelineProps) {
  const steps = buildTimelineSteps(applicationStatus, createdAt, submittedAt, reviewedAt)

  return (
    <div className="w-full py-2">
      {/* Horizontal layout on medium/large screens, vertical layout on mobile */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-4">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1

          return (
            <div
              key={step.label}
              className="flex flex-1 flex-col md:flex-row md:items-center gap-4 w-full"
            >
              <div className="flex items-center gap-3">
                {/* Icon */}
                <div className="relative z-10 flex shrink-0 items-center justify-center rounded-full bg-background">
                  {step.status === "completed" ? (
                    <CheckCircle2Icon className="size-6 text-emerald-500" />
                  ) : step.status === "current" ? (
                    <CircleDotIcon className="size-6 text-amber-500 animate-pulse" />
                  ) : step.status === "rejected" ? (
                    <XCircleIcon className="size-6 text-destructive" />
                  ) : (
                    <CircleIcon className="size-6 text-muted-foreground/40" />
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-sm font-semibold whitespace-nowrap",
                      step.status === "upcoming"
                        ? "text-muted-foreground/60"
                        : step.status === "rejected"
                          ? "text-destructive"
                          : "text-foreground"
                    )}
                  >
                    {step.label}
                  </p>
                  {step.timestamp ? (
                    <p className="mt-0.5 text-xs text-muted-foreground whitespace-nowrap">
                      {formatTimestamp(step.timestamp)}
                    </p>
                  ) : (
                    <p className="mt-0.5 text-xs text-transparent select-none whitespace-nowrap">—</p>
                  )}
                </div>
              </div>

              {/* Desktop connector line */}
              {!isLast && (
                <div
                  className={cn(
                    "hidden md:block h-0.5 flex-1 min-w-[20px]",
                    step.status === "completed" ? "bg-emerald-500" : "bg-border"
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
