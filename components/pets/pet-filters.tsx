"use client"

import { useCallback, useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import type { PetGender, PetSize, PetSpecies } from "@prisma/client"
import { SearchIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  PET_GENDER_LABELS,
  PET_GENDER_VALUES,
  PET_SIZE_OPTIONS,
  PET_SPECIES_LABELS,
  PET_SPECIES_VALUES,
} from "@/lib/constants/pet"
import { buildPetListHref, type PetListFilters } from "@/lib/utils/pet-list"
import { cn } from "@/lib/utils"

type PetFiltersProps = {
  filters: PetListFilters
  basePath?: string
}

export function PetFilters({ filters, basePath = "/pets" }: PetFiltersProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState(filters.search ?? "")

  useEffect(() => {
    setSearch(filters.search ?? "")
  }, [filters.search])

  const hasActiveFilters = Boolean(
    filters.species || filters.size || filters.gender || filters.search
  )

  const applyFilters = useCallback(
    (next: PetListFilters) => {
      startTransition(() => {
        router.push(buildPetListHref(basePath, next, 1))
      })
    },
    [basePath, router]
  )

  useEffect(() => {
    const timeout = setTimeout(() => {
      const trimmed = search.trim()

      if (trimmed === (filters.search ?? "")) {
        return
      }

      applyFilters({
        ...filters,
        search: trimmed || undefined,
      })
    }, 400)

    return () => clearTimeout(timeout)
  }, [search, filters, applyFilters])

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border bg-card/50 px-3 py-2.5 sm:flex-row sm:flex-wrap sm:items-center",
        isPending && "opacity-70"
      )}
    >
      <div className="relative min-w-0 flex-1 sm:min-w-[12rem] sm:max-w-xs">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name or breed"
          className="h-8 border-transparent bg-background pl-8 text-sm shadow-none"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={filters.species ?? ""}
          onValueChange={(value) =>
            applyFilters({ ...filters, species: value as PetSpecies })
          }
        >
          <SelectTrigger size="sm" className="w-[8.5rem] bg-background">
            <SelectValue placeholder="Species" />
          </SelectTrigger>
          <SelectContent>
            {PET_SPECIES_VALUES.map((value) => (
              <SelectItem key={value} value={value}>
                {PET_SPECIES_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.size ?? ""}
          onValueChange={(value) =>
            applyFilters({ ...filters, size: value as PetSize })
          }
        >
          <SelectTrigger size="sm" className="w-[10.5rem] bg-background">
            <SelectValue placeholder="Size" />
          </SelectTrigger>
          <SelectContent>
            {PET_SIZE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.gender ?? ""}
          onValueChange={(value) =>
            applyFilters({ ...filters, gender: value as PetGender })
          }
        >
          <SelectTrigger size="sm" className="w-[8.5rem] bg-background">
            <SelectValue placeholder="Gender" />
          </SelectTrigger>
          <SelectContent>
            {PET_GENDER_VALUES.map((value) => (
              <SelectItem key={value} value={value}>
                {PET_GENDER_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-muted-foreground"
            onClick={() => {
              setSearch("")
              applyFilters({})
            }}
          >
            <XIcon className="size-3.5" />
            Clear
          </Button>
        ) : null}
      </div>
    </div>
  )
}
