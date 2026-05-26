"use client"

import Link from "next/link"
import { PencilIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type ShelterTableActionsProps = {
  shelterId: string
}

export function ShelterTableActions({ shelterId }: ShelterTableActionsProps) {
  return (
    <TooltipProvider>
      <div className="flex items-center justify-end gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" asChild>
              <Link href={`/shelters/${shelterId}/edit`}>
                <PencilIcon />
                <span className="sr-only">Edit shelter</span>
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
              aria-disabled
            >
              <Trash2Icon />
              <span className="sr-only">Delete shelter</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete (coming soon)</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
