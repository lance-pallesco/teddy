export type DashboardRole = "ADMIN" | "SHELTER_STAFF" | "RESCUER" | "ADOPTER"

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
    {
      title: "Shelter Management",
      url: "/shelters",
      icon: "Building2",
      items: [
        { title: "All Shelters", url: "/shelters" },
        { title: "Create Shelter", url: "/shelters/create" },
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
    { title: "Pet Listings", url: "/pets", icon: "PawPrint", items: [{ title: "All Pets", url: "/pets" }] },
    { title: "Applications", url: "/applications", icon: "ClipboardList" },
    { title: "Analytics & Reports", url: "/analytics", icon: "ChartNoAxesColumn" },
    { title: "Profile Settings", url: "/profile", icon: "Settings" },
  ],
  SHELTER_STAFF: [
    { title: "Dashboard", url: "/dashboard", icon: "LayoutDashboard" },
    {
      title: "My Pets",
      url: "/pets",
      icon: "PawPrint",
      items: [
        { title: "All Pets", url: "/pets" },
        { title: "Add New Pet", url: "/pets/new" },
      ],
    },
    { title: "Adoption Applications", url: "/applications", icon: "ClipboardList" },
    {
      title: "My Shelter",
      url: "/shelter/profile",
      icon: "Building2",
      items: [
        { title: "Shelter Profile", url: "/shelter/profile" },
        { title: "Shelter Staff", url: "/shelter/staff" },
      ],
    },
    { title: "Medical Records", url: "/medical/records", icon: "FileHeart" },
    { title: "Profile Settings", url: "/profile", icon: "Settings" },
  ],
  RESCUER: [
    { title: "Dashboard", url: "/dashboard", icon: "LayoutDashboard" },
    {
      title: "My Pets",
      url: "/pets/my",
      icon: "PawPrint",
      items: [
        { title: "My Pet Listings", url: "/pets/my" },
        { title: "Add New Pet", url: "/pets/new" },
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

export function getAllowedDashboardPaths(role: DashboardRole) {
  const paths = new Set<string>()

  for (const item of dashboardNavigation[role]) {
    paths.add(item.url)
    for (const child of item.items ?? []) {
      paths.add(child.url)
    }
  }

  return paths
}

export function canAccessDashboardPath(role: DashboardRole, pathname: string) {
  if (pathname === "/unauthorized") {
    return true
  }

  return getAllowedDashboardPaths(role).has(pathname)
}
