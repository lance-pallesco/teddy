import "server-only"

import { redirect } from "next/navigation"

import { getCurrentUser } from "@/lib/auth/session"
import type { DashboardRole } from "@/lib/navigation/dashboard-nav"

export async function requireRole(roles: DashboardRole[]) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (!roles.includes(user.role as DashboardRole)) {
    redirect("/unauthorized")
  }

  return user
}
