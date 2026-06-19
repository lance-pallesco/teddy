import Link from "next/link"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

type PaginationProps = {
  page: number
  totalPages: number
  total: number
  buildHref: (page: number) => string
  itemLabel?: string
}

export function Pagination({
  page,
  totalPages,
  total,
  buildHref,
  itemLabel = "item",
}: PaginationProps) {
  const pluralLabel = total === 1 ? itemLabel : `${itemLabel}s`

  if (totalPages <= 1) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        Showing {total} {pluralLabel}
      </p>
    )
  }

  const prevHref = page > 1 ? buildHref(page - 1) : null
  const nextHref = page < totalPages ? buildHref(page + 1) : null

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages} · {total} {pluralLabel} total
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
