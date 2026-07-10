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
            <SidebarMenuButton asChild size="lg" className="group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:justify-center">
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg shrink-0">
                  <Image src="/logo.png" alt="Teddy" width={28} height={28} className="group-data-[collapsible=icon]:w-5 group-data-[collapsible=icon]:h-5 transition-all" />
                </div>
                <div className="grid flex-1 text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate text-xl tracking-tighter">Teddy</span>
                  <span className="truncate text-xs font-light">Pet Adoption</span>
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
