export type DashboardRole = "ADMIN" | "SHELTER_STAFF" | "PET_OWNER" | "ADOPTER"

export type DashboardNavItem = {
  title: string
  url: string
  icon: string
  items?: {
    title: string
    url: string
  }[]
}

export const dashboardNavigation: Record<DashboardRole, DashboardNavItem[]> = {
  ADMIN: [
    { title: "Dashboard", url: "/dashboard", icon: "LayoutDashboard" },
    { title: "Shelters", url: "/shelters", icon: "Building2" },
    { title: "Users", url: "/users", icon: "Users" },
    { title: "Pets", url: "/pets", icon: "PawPrint" },
    { title: "Applications", url: "/applications", icon: "ClipboardList" },
    { title: "Analytics & Reports", url: "/analytics", icon: "ChartNoAxesColumn" },
    { title: "Notifications", url: "/notifications", icon: "Bell" },
    { title: "Profile Settings", url: "/profile", icon: "Settings" },
  ],
  SHELTER_STAFF: [
    { title: "Dashboard", url: "/dashboard", icon: "LayoutDashboard" },
    { title: "My Pets", url: "/pets", icon: "PawPrint" },
    { title: "Adoption Requests", url: "/applications", icon: "FileHeart" },
    { title: "My Shelter", url: "/shelter/profile", icon: "Building2" },
    { title: "Notifications", url: "/notifications", icon: "Bell" },
    { title: "Profile Settings", url: "/profile", icon: "Settings" },
  ],
  PET_OWNER: [
    { title: "Dashboard", url: "/dashboard", icon: "LayoutDashboard" },
    { title: "Pets", url: "/pets", icon: "PawPrint" },
    { title: "Adoption Requests", url: "/applications", icon: "FileHeart", },
    { title: "Notifications", url: "/notifications", icon: "Bell" },
    { title: "Profile Settings", url: "/profile", icon: "Settings" },
  ],
  ADOPTER: [
    { title: "Dashboard", url: "/dashboard", icon: "LayoutDashboard" },
    { title: "Browse Pets", url: "/pets", icon: "PawPrint" },
    { title: "Find My Match", url: "/pets/match", icon: "Search" },
    { title: "My Applications", url: "/applications", icon: "Folders"},
    { title: "Notifications", url: "/notifications", icon: "Bell" },
    { title: "Profile Settings", url: "/profile", icon: "Settings" },
  ],
}

export function isDashboardRole(role: string): role is DashboardRole {
  return role in dashboardNavigation
}

/**
 * Whether a nav item (or child) should appear active for the current pathname.
 * UI-only — not used for authorization.
 */
export function isNavItemActive(pathname: string, url: string): boolean {
  const normalizedPath = pathname.length > 1 && pathname.endsWith("/")
    ? pathname.slice(0, -1)
    : pathname

  if (normalizedPath === url) {
    return true
  }

  if (url === "/dashboard") {
    return false
  }

  return normalizedPath.startsWith(`${url}/`)
}
