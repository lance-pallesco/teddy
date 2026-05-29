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

/** Sidebar navigation only — not used for route authorization. */
export const dashboardNavigation: Record<DashboardRole, DashboardNavItem[]> = {
  ADMIN: [
    { title: "Dashboard", url: "/dashboard", icon: "LayoutDashboard" },
    {
      title: "Shelter Management",
      url: "/shelters",
      icon: "Building2",
      items: [
        { title: "All Shelters", url: "/shelters" },
        { title: "Shelter Staff", url: "/shelters/staff" },
      ],
    },
    {
      title: "User Management",
      url: "/users",
      icon: "Users",
      items: [
        { title: "All Users", url: "/users" },
        { title: "Deactivated Accounts", url: "/users/deactivated" },
      ],
    },
    {
      title: "Pet Listings",
      url: "/pets",
      icon: "PawPrint",
      items: [{ title: "All Pets", url: "/pets" }],
    },
    { title: "Applications", url: "/applications", icon: "ClipboardList" },
    { title: "Analytics & Reports", url: "/analytics", icon: "ChartNoAxesColumn" },
    { title: "Profile Settings", url: "/profile", icon: "Settings" },
  ],
  SHELTER_STAFF: [
    { title: "Dashboard", url: "/dashboard", icon: "LayoutDashboard" },
    {
      title: "Pets",
      url: "/pets",
      icon: "PawPrint",
      items: [
        { title: "Shelter Pets", url: "/pets" },
        { title: "Add New Pet", url: "/pets/new" },
      ],
    },
    { title: "Adoption Requests", url: "/applications", icon: "FileHeart" },
    {
      title: "My Shelter",
      url: "/shelter/profile",
      icon: "Building2",
      items: [
        { title: "Shelter Profile", url: "/shelter/profile" },
        { title: "Shelter Staff", url: "/shelter/staff" },
      ],
    },
    { title: "Medical Records", url: "/medical/records", icon: "ClipboardList" },
    { title: "Profile Settings", url: "/profile", icon: "Settings" },
  ],
  PET_OWNER: [
    { title: "Dashboard", url: "/dashboard", icon: "LayoutDashboard" },
    {
      title: "Pets",
      url: "/pets",
      icon: "PawPrint",
      items: [
        { title: "My Pets", url: "/pets" },
        { title: "Post a Pet", url: "/pets/new" },
      ],
    },
    {
      title: "Adoption Applications",
      url: "/applications/incoming",
      icon: "ClipboardList",
      items: [
        { title: "Incoming Applications", url: "/applications/incoming" },
        { title: "Approved Adoptions", url: "/applications/approved" },
      ],
    },
    { title: "Medical Records", url: "/medical/records", icon: "FileHeart" },
    { title: "Profile Settings", url: "/profile", icon: "Settings" },
  ],
  ADOPTER: [
    { title: "Dashboard", url: "/dashboard", icon: "LayoutDashboard" },
    {
      title: "Browse Pets",
      url: "/pets/browse",
      icon: "Search",
      items: [
        { title: "All Available Pets", url: "/pets/browse" },
        { title: "Find My Match", url: "/pets/match" },
      ],
    },
    {
      title: "My Applications",
      url: "/applications",
      icon: "ClipboardList",
      items: [
        { title: "All Applications", url: "/applications" },
        { title: "Active Applications", url: "/applications/active" },
        { title: "Application History", url: "/applications/history" },
      ],
    },
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
