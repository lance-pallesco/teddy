import type { AdoptionStatus } from "@prisma/client"

import { Badge, type BadgeProps } from "@/components/ui/badge"

const STATUS_CONFIG: Record<AdoptionStatus, { label: string; variant: BadgeProps["variant"] }> = {
  DRAFT: { label: "Draft", variant: "secondary" },
  PENDING: { label: "Pending", variant: "warning" },
  UNDER_REVIEW: { label: "Under Review", variant: "outline" },
  INTERVIEW_IN_PROGRESS: { label: "Interview", variant: "default" },
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
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  )
}
