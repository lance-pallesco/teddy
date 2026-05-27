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
import { isNavItemActive } from "@/lib/navigation/dashboard-nav"

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

export function DashboardNavGroup({ items }: { items: DashboardNavItem[] }) {
  const pathname = usePathname()
  const activeChildByParent = new Map<string, string>()

  for (const item of items) {
    if (!item.items?.length) {
      continue
    }

    const matchingChildren = item.items
      .map((child) => child.url)
      .filter((url) => isNavItemActive(pathname, url))
      .sort((a, b) => b.length - a.length)

    if (matchingChildren.length > 0) {
      activeChildByParent.set(item.title, matchingChildren[0])
    }
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Workspace</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const Icon = icons[item.icon as keyof typeof icons] ?? LayoutDashboardIcon
          const activeChildUrl = activeChildByParent.get(item.title)
          const isActive =
            isNavItemActive(pathname, item.url) ||
            Boolean(activeChildUrl)

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
                          isActive={activeChildUrl === child.url}
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
