import type { PetStatus } from "@prisma/client"

import { Badge } from "@/components/ui/badge"
import {
  PET_STATUS_BADGE_VARIANT,
  PET_STATUS_LABELS,
} from "@/lib/constants/pet"

type PetStatusBadgeProps = {
  status: PetStatus
  className?: string
}

export function PetStatusBadge({ status, className }: PetStatusBadgeProps) {
  return (
    <Badge variant={PET_STATUS_BADGE_VARIANT[status]} className={className}>
      {PET_STATUS_LABELS[status]}
    </Badge>
  )
}
