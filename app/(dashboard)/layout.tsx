import { redirect } from "next/navigation"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { getCurrentUser } from "@/lib/auth/session"
import { isDashboardRole } from "@/lib/navigation/dashboard-nav"
import { BreadcrumbProvider } from "@/components/dashboard/breadcrumb-context"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }

  if (!isDashboardRole(user.role)) {
    redirect("/unauthorized")
  }

  return (
    <SidebarProvider>
      <BreadcrumbProvider>
        <DashboardSidebar
          role={user.role}
          user={{
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
          }}
        />
        <SidebarInset>
          <DashboardHeader />
          {children}
        </SidebarInset>
      </BreadcrumbProvider>
    </SidebarProvider>
  )
}
