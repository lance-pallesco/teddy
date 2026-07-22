import type { AdoptionStatus } from "@prisma/client"

export const APPLICATION_LIST_PAGE_SIZE = 10

export type ApplicationTab = "all" | "active" | "completed" | "draft"

export const APPLICATION_TAB_VALUES = ["all", "active", "completed", "draft"] as const

export type ApplicationListSearchParams = Record<string, string | string[] | undefined>

export type ApplicationListFilters = {
  tab?: ApplicationTab
  status?: AdoptionStatus
  petId?: string
}

export type ParsedApplicationListQuery = {
  filters: ApplicationListFilters
  page: number
  pageSize: number
}

const ADOPTION_STATUS_VALUES: readonly string[] = [
  "DRAFT",
  "PENDING",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
  "WITHDRAWN",
]

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0]
  }

  return value
}

export function parseApplicationListQuery(
  searchParams: ApplicationListSearchParams,
  pageSize = APPLICATION_LIST_PAGE_SIZE
): ParsedApplicationListQuery {
  const tabParam = firstParam(searchParams.tab)
  const tab: ApplicationTab =
    tabParam === "active" ? "active"
      : tabParam === "completed" ? "completed"
        : tabParam === "draft" ? "draft"
          : "all"

  const statusParam = firstParam(searchParams.status)
  const status = statusParam && ADOPTION_STATUS_VALUES.includes(statusParam)
    ? (statusParam as AdoptionStatus)
    : undefined

  const petId = firstParam(searchParams.petId) || undefined

  const rawPage = Number.parseInt(firstParam(searchParams.page) ?? "1", 10)
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1

  return {
    filters: { tab, status, petId },
    page,
    pageSize,
  }
}

export function buildApplicationListHref(
  basePath: string,
  filters: ApplicationListFilters,
  page: number
): string {
  const params = new URLSearchParams()

  if (filters.tab && filters.tab !== "all") {
    params.set("tab", filters.tab)
  }

  if (filters.status) {
    params.set("status", filters.status)
  }

  if (filters.petId) {
    params.set("petId", filters.petId)
  }

  if (page > 1) {
    params.set("page", String(page))
  }

  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}
