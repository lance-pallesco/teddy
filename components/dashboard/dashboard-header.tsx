import { DashboardBreadcrumb } from "@/components/dashboard/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { NotificationBell } from "@/components/dashboard/notification-bell"

export function DashboardHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex w-full items-center justify-between px-4 min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-vertical:h-4 data-vertical:self-auto"
          />
          <DashboardBreadcrumb />
        </div>
        <div className="flex items-center gap-4">
          <NotificationBell />
        </div>
      </div>
    </header>
  )
}
