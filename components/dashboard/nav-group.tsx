"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChartNoAxesColumnIcon,
  ChevronRightIcon,
  ClipboardListIcon,
  FileHeartIcon,
  BellIcon,
  FilePen,
  HousePlusIcon,
  LayoutDashboardIcon,
  PawPrintIcon,
  HandHeart,
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
  Building2: HandHeart,
  ChartNoAxesColumn: ChartNoAxesColumnIcon,
  ClipboardList: ClipboardListIcon,
  FileHeart: FileHeartIcon,
  LayoutDashboard: HousePlusIcon,
  PawPrint: PawPrintIcon,
  Bell: BellIcon,
  Folders: FilePen,
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
      <SidebarMenu className="space-y-2 px-2 group-data-[collapsible=icon]:px-0">
        {items.map((item) => {
          const Icon = icons[item.icon as keyof typeof icons] ?? LayoutDashboardIcon
          const activeChildUrl = activeChildByParent.get(item.title)
          const isActive =
            isNavItemActive(pathname, item.url) ||
            Boolean(activeChildUrl)

          if (!item.items?.length) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.title}
                  className="font-normal text-[#3D3C3A] [&_svg]:size-5 h-10 group-data-[collapsible=icon]:[&_svg]:size-4 group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:[&_span]:!hidden data-[active=true]:bg-[#AE8F65] data-[active=true]:text-white data-[active=true]:hover:bg-[#AE8F65]/90 data-[active=true]:font-light"
                >
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
                  <SidebarMenuButton
                    isActive={isActive}
                    tooltip={item.title}
                    className="text-base [&_svg]:size-5 h-10 group-data-[collapsible=icon]:[&_svg]:size-4 group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:[&_span]:!hidden group-data-[collapsible=icon]:[&_.ml-auto]:!hidden data-[active=true]:bg-[#AE8F65] data-[active=true]:text-white data-[active=true]:hover:bg-[#AE8F65]/90"
                  >
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
                          className="text-[15px] h-9 data-[active=true]:bg-[#AE8F65] data-[active=true]:text-white data-[active=true]:hover:bg-[#AE8F65]/90"
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
