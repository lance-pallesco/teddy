import type { AdoptionStatus } from "@prisma/client"

import { Badge, type BadgeProps } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const STATUS_CONFIG: Record<
  AdoptionStatus,
  { label: string; variant?: BadgeProps["variant"]; customClass?: string }
> = {
  DRAFT: { label: "Draft", variant: "secondary" },
  PENDING: { label: "Pending", variant: "warning" },
  UNDER_REVIEW: {
    label: "Screening",
    customClass: "bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-400",
  },
  INTERVIEW_IN_PROGRESS: {
    label: "Interview",
    customClass: "bg-indigo-500/10 text-indigo-700 border-indigo-500/20 dark:text-indigo-400",
  },
  APPROVED: { label: "Approved", variant: "success" },
  REJECTED: { label: "Rejected", variant: "danger" },
  WITHDRAWN: { label: "Withdrawn", variant: "secondary" },
}

type ApplicationStatusBadgeProps = {
  status: AdoptionStatus
  className?: string
}

export function ApplicationStatusBadge({ status, className }: ApplicationStatusBadgeProps) {
  const config = STATUS_CONFIG[status]

  return (
    <Badge
      variant={config.variant}
      className={cn(
        "text-[10px] uppercase tracking-wider font-bold shadow-none",
        config.customClass,
        className
      )}
    >
      {config.label}
    </Badge>
  )
}
