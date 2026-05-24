"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Building2Icon,
  ChartNoAxesColumnIcon,
  ChevronRightIcon,
  ClipboardListIcon,
  FileHeartIcon,
  LayoutDashboardIcon,
  PawPrintIcon,
  SearchIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import type { DashboardNavItem } from "@/lib/navigation/dashboard-nav"

const icons = {
  Building2: Building2Icon,
  ChartNoAxesColumn: ChartNoAxesColumnIcon,
  ClipboardList: ClipboardListIcon,
  FileHeart: FileHeartIcon,
  LayoutDashboard: LayoutDashboardIcon,
  PawPrint: PawPrintIcon,
  Search: SearchIcon,
  Settings: SettingsIcon,
  Users: UsersIcon,
}

function isActivePath(pathname: string, url: string) {
  return pathname === url
}

export function DashboardNavGroup({ items }: { items: DashboardNavItem[] }) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Workspace</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const Icon = icons[item.icon as keyof typeof icons] ?? LayoutDashboardIcon
          const isActive =
            isActivePath(pathname, item.url) ||
            item.items?.some((child) => isActivePath(pathname, child.url))

          if (!item.items?.length) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                  <Link href={item.url}>
                    <Icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          }

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton isActive={isActive} tooltip={item.title}>
                    <Icon />
                    <span>{item.title}</span>
                    <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((child) => (
                      <SidebarMenuSubItem key={child.title}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isActivePath(pathname, child.url)}
                        >
                          <Link href={child.url}>
                            <span>{child.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
