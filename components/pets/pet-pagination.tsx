import Link from "next/link"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { buildPetListHref, type PetListFilters } from "@/lib/utils/pet-list"

type PetPaginationProps = {
  basePath?: string
  filters: PetListFilters
  page: number
  totalPages: number
  total: number
}

export function PetPagination({
  basePath = "/pets",
  filters,
  page,
  totalPages,
  total,
}: PetPaginationProps) {
  if (totalPages <= 1) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        Showing {total} {total === 1 ? "pet" : "pets"}
      </p>
    )
  }

  const prevHref = page > 1 ? buildPetListHref(basePath, filters, page - 1) : null
  const nextHref =
    page < totalPages ? buildPetListHref(basePath, filters, page + 1) : null

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages} · {total} {total === 1 ? "pet" : "pets"} total
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={!prevHref} asChild={!!prevHref}>
          {prevHref ? (
            <Link href={prevHref}>
              <ChevronLeftIcon />
              Previous
            </Link>
          ) : (
            <span>
              <ChevronLeftIcon />
              Previous
            </span>
          )}
        </Button>
        <Button variant="outline" size="sm" disabled={!nextHref} asChild={!!nextHref}>
          {nextHref ? (
            <Link href={nextHref}>
              Next
              <ChevronRightIcon />
            </Link>
          ) : (
            <span>
              Next
              <ChevronRightIcon />
            </span>
          )}
        </Button>
      </div>
    </div>
  )
}
