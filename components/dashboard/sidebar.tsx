import Image from "next/image"
import Link from "next/link"

import { DashboardNavGroup } from "@/components/dashboard/nav-group"
import { DashboardUserNav } from "@/components/dashboard/user-nav"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import type { DashboardRole } from "@/lib/navigation/dashboard-nav"
import { dashboardNavigation } from "@/lib/navigation/dashboard-nav"

type DashboardSidebarProps = React.ComponentProps<typeof Sidebar> & {
  role: DashboardRole
  user: {
    name: string
    email: string
    avatar: string | null
    role: string
  }
}

export function DashboardSidebar({ role, user, ...props }: DashboardSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
                  <Image src="/logo.png" alt="Teddy" width={32} height={32} />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Teddy</span>
                  <span className="truncate text-xs">Pet Adoption</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <DashboardNavGroup items={dashboardNavigation[role]} />
      </SidebarContent>
      <SidebarFooter>
        <DashboardUserNav user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
