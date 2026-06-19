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
  const isSubmitted = ["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED", "WITHDRAWN"].includes(status)
  steps.push({
    label: "Submitted",
    timestamp: submittedAt,
    status: isSubmitted
      ? status === "PENDING" ? "current" : "completed"
      : status === "WITHDRAWN" ? "completed" : "upcoming",
  })

  // Step 3: Under Review
  const isReviewed = ["UNDER_REVIEW", "APPROVED", "REJECTED"].includes(status)
  steps.push({
    label: "Under Review",
    timestamp: isReviewed ? reviewedAt : null,
    status: isReviewed
      ? status === "UNDER_REVIEW" ? "current" : "completed"
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
    <div className="rounded-lg border bg-card p-5">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Application Progress
      </h3>
      <div className="relative space-y-0">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1

          return (
            <div key={step.label} className="relative flex gap-4">
              {/* Vertical line */}
              {!isLast && (
                <div
                  className={cn(
                    "absolute left-[11px] top-6 h-full w-0.5",
                    step.status === "completed"
                      ? "bg-emerald-500/40"
                      : "bg-border"
                  )}
                />
              )}

              {/* Icon */}
              <div className="relative z-10 flex shrink-0 items-start pt-0.5">
                {step.status === "completed" ? (
                  <CheckCircle2Icon className="size-6 text-emerald-500" />
                ) : step.status === "current" ? (
                  <CircleDotIcon className="size-6 text-amber-500" />
                ) : step.status === "rejected" ? (
                  <XCircleIcon className="size-6 text-destructive" />
                ) : (
                  <CircleIcon className="size-6 text-muted-foreground/40" />
                )}
              </div>

              {/* Content */}
              <div className={cn("pb-6", isLast && "pb-0")}>
                <p
                  className={cn(
                    "text-sm font-medium",
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
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatTimestamp(step.timestamp)}
                  </p>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
