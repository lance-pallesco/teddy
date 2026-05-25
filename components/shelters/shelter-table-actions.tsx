"use client"

import Link from "next/link"
import { PencilIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type ShelterTableActionsProps = {
  shelterId: string
}

export function ShelterTableActions({ shelterId }: ShelterTableActionsProps) {
  return (
    <div className="flex items-center gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href={`/shelters/${shelterId}/edit`} aria-label={`Edit shelter ${shelterId}`}>
              <PencilIcon />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Edit shelter</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled
            aria-label="Delete shelter (coming soon)"
          >
            <Trash2Icon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Delete (coming soon)</TooltipContent>
      </Tooltip>
    </div>
  )
}
