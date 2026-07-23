"use client"

import { useCallback, useTransition } from "react"
import { useRouter } from "next/navigation"
import type { AdoptionStatus } from "@prisma/client"
import { XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  buildApplicationListHref,
  type ApplicationListFilters,
} from "@/lib/utils/application-list"
import { cn } from "@/lib/utils"

type ApplicationFiltersProps = {
  filters: ApplicationListFilters
  pets: { id: string; name: string }[]
  basePath?: string
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "ALL", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
]

export function ApplicationFilters({
  filters,
  pets,
  basePath = "/applications",
}: ApplicationFiltersProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const applyFilters = useCallback(
    (next: ApplicationListFilters) => {
      startTransition(() => {
        router.push(buildApplicationListHref(basePath, next, 1))
      })
    },
    [basePath, router]
  )

  const hasActiveFilters = Boolean(
    (filters.status && filters.status !== ("ALL" as unknown as AdoptionStatus)) ||
      (filters.petId && filters.petId !== "ALL")
  )

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border bg-card/50 px-3 py-2.5 sm:flex-row sm:flex-wrap sm:items-center",
        isPending && "opacity-70"
      )}
    >
      <Select
        value={filters.status ?? "ALL"}
        onValueChange={(value) =>
          applyFilters({
            ...filters,
            status: value === "ALL" ? undefined : (value as AdoptionStatus),
          })
        }
      >
        <SelectTrigger size="sm" className="w-[10rem] bg-background">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.petId ?? "ALL"}
        onValueChange={(value) =>
          applyFilters({
            ...filters,
            petId: value === "ALL" ? undefined : value,
          })
        }
      >
        <SelectTrigger size="sm" className="w-[14rem] bg-background">
          <SelectValue placeholder="All Pets" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Pets</SelectItem>
          {pets.map((pet) => (
            <SelectItem key={pet.id} value={pet.id}>
              {pet.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-muted-foreground hover:text-foreground cursor-pointer"
          onClick={() => applyFilters({})}
        >
          <XIcon className="size-3.5 mr-1" />
          Clear
        </Button>
      ) : null}
    </div>
  )
}
