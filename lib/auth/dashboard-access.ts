import type { DashboardRole } from "@/lib/navigation/dashboard-nav"

/**
 * Dashboard route access (authorization).
 *
 * Navigation labels/URLs live in `dashboard-nav.ts` and must NOT be used for security.
 * Add new pages under an existing module prefix here once — no per-route whitelist maintenance.
 */

type RouteAccessRule = {
  /** Exact paths (normalized, no trailing slash). */
  paths?: readonly string[]
  /**
   * Path prefixes: allows the prefix itself and any nested path (`${prefix}/...`).
   * Example: `/shelters` covers `/shelters/new`, `/shelters/[id]/staff/new`, etc.
   */
  prefixes?: readonly string[]
}

const dashboardRouteAccess: Record<DashboardRole, RouteAccessRule> = {
  ADMIN: {
    paths: ["/dashboard", "/profile", "/unauthorized"],
    prefixes: [
      "/shelters",
      "/users",
      "/pets",
      "/applications",
      "/analytics",
    ],
  },
  SHELTER_STAFF: {
    paths: ["/dashboard", "/profile", "/unauthorized"],
    prefixes: ["/shelter", "/pets", "/applications", "/medical"],
  },
  PET_OWNER: {
    paths: ["/dashboard", "/profile", "/unauthorized"],
    prefixes: ["/pets", "/applications", "/medical"],
  },
  ADOPTER: {
    paths: ["/dashboard", "/profile", "/unauthorized"],
    prefixes: ["/applications", "/pets/browse", "/pets/match"],
  },
}

export function normalizeDashboardPathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1)
  }

  return pathname
}

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

export function canAccessDashboardPath(
  role: DashboardRole,
  pathname: string
): boolean {
  const normalized = normalizeDashboardPathname(pathname)
  const rules = dashboardRouteAccess[role]

  if (rules.paths?.includes(normalized)) {
    return true
  }

  return rules.prefixes?.some((prefix) => matchesPrefix(normalized, prefix)) ?? false
}
