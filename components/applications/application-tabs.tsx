"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import {
  buildApplicationListHref,
  type ApplicationListFilters,
  type ApplicationTab,
} from "@/lib/utils/application-list"

type ApplicationTabsProps = {
  filters: ApplicationListFilters
  basePath?: string
}

const tabs: { id: ApplicationTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "completed", label: "Completed" },
]

export function ApplicationTabs({
  filters,
  basePath = "/applications",
}: ApplicationTabsProps) {
  const pathname = usePathname()
  const activeTab = filters.tab ?? "all"

  return (
    <div className="flex gap-1 rounded-lg border bg-muted/30 p-1">
      {tabs.map((tab) => {
        const href = buildApplicationListHref(
          basePath,
          { ...filters, tab: tab.id },
          1
        )
        const isActive = activeTab === tab.id

        return (
          <Link
            key={tab.id}
            href={href}
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
              pathname === basePath && isActive && "bg-background"
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
