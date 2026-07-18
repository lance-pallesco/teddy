"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { buildPetListHref, type PetListFilters } from "@/lib/utils/pet-list"
import { cn } from "@/lib/utils"

type PetManagementTabsProps = {
  filters: PetListFilters
  basePath?: string
}

export function PetManagementTabs({
  filters,
  basePath = "/pets",
}: PetManagementTabsProps) {
  const pathname = usePathname()
  const activeTab = filters.tab === "archived" ? "archived" : "active"

  const tabs = [
    { id: "active" as const, label: "Active" },
    { id: "archived" as const, label: "Archived" },
  ]

  return (
    <div className="flex gap-1 rounded-lg border bg-[#8B7E74]/10 p-1">
      {tabs.map((tab) => {
        const href = buildPetListHref(
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
