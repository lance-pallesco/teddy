"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Building2Icon,
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  PawPrintIcon,
  UsersIcon,
  PencilIcon,
  EyeIcon,
  SearchIcon,
  PlusIcon,
  InboxIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ShelterStatusActions } from "./shelter-status-actions"

type ShelterListItem = {
  id: string
  name: string
  slug: string
  logo: string | null
  city: string
  province: string
  phone: string
  email: string
  isActive: boolean
  createdAt: Date
  _count: {
    users: number
    pets: number
  }
}

interface SheltersClientProps {
  initialShelters: ShelterListItem[]
}

type TabType = "all" | "active" | "inactive"

export function SheltersClient({ initialShelters }: SheltersClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<TabType>("all")

  // Filter shelters locally
  const filteredShelters = initialShelters.filter((shelter) => {
    // 1. Filter by tab status
    if (activeTab === "active" && !shelter.isActive) return false
    if (activeTab === "inactive" && shelter.isActive) return false

    // 2. Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      const matchesName = shelter.name.toLowerCase().includes(query)
      const matchesCity = shelter.city.toLowerCase().includes(query)
      const matchesProvince = shelter.province.toLowerCase().includes(query)
      return matchesName || matchesCity || matchesProvince
    }

    return true
  })

  const tabOptions = [
    { id: "all" as const, label: `All Shelters (${initialShelters.length})` },
    {
      id: "active" as const,
      label: `Active (${initialShelters.filter((s) => s.isActive).length})`,
    },
    {
      id: "inactive" as const,
      label: `Inactive (${initialShelters.filter((s) => !s.isActive).length})`,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2">
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search shelters by name, city, or province..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white dark:bg-[#1E1A16]"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex gap-1 rounded-lg border bg-[#8B7E74]/10 p-1 w-fit shadow-none">
          {tabOptions.map((option) => {
            const isActive = activeTab === option.id
            return (
              <button
                key={option.id}
                onClick={() => setActiveTab(option.id)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap",
                  isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Grid Display */}
      {filteredShelters.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredShelters.map((shelter) => (
            <Card
              key={shelter.id}
              className="overflow-hidden border-primary/10 hover:shadow-md transition-shadow duration-200 bg-white flex flex-col justify-between"
            >
              <div>
                <div className="h-16 w-full bg-gradient-to-r from-[#AE8F65]/20 to-[#8B7E74]/10 relative">
                  <div className="absolute -bottom-6 left-5 size-12 rounded-lg bg-white shadow-xs border overflow-hidden flex items-center justify-center shrink-0">
                    {shelter.logo ? (
                      <Image
                        src={shelter.logo}
                        alt={shelter.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                        unoptimized={shelter.logo.startsWith("/uploads/")}
                      />
                    ) : (
                      <Building2Icon className="size-6 text-[#AE8F65] opacity-60" />
                    )}
                  </div>
                </div>

                <CardContent className="pt-8 px-5 pb-4 space-y-4">
                  {/* Title & Status */}
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        className="font-bold text-base text-[#3D3C3A] leading-tight truncate"
                        title={shelter.name}
                      >
                        {shelter.name}
                      </h3>
                      <Badge
                        variant={shelter.isActive ? "success" : "warning"}
                        className="shrink-0 text-[10px]"
                      >
                        {shelter.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <MapPinIcon className="size-3.5 shrink-0" />
                      {shelter.city}, {shelter.province}
                    </p>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-2 gap-2 py-2 border-y border-border/60">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-[#AE8F65]/10 text-[#AE8F65]">
                        <PawPrintIcon className="size-3.5" />
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground leading-none">Pets</div>
                        <div className="text-xs font-bold">{shelter._count.pets}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-[#8B7E74]/20 text-[#8B7E74]">
                        <UsersIcon className="size-3.5" />
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground leading-none">Staff</div>
                        <div className="text-xs font-bold">{shelter._count.users}</div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div className="space-y-1 text-xs text-muted-foreground pt-1">
                    <div className="flex items-center gap-2 truncate">
                      <PhoneIcon className="size-3.5 shrink-0 text-muted-foreground/60" />
                      <span>{shelter.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate" title={shelter.email}>
                      <MailIcon className="size-3.5 shrink-0 text-muted-foreground/60" />
                      <span>{shelter.email}</span>
                    </div>
                  </div>
                </CardContent>
              </div>

               <CardFooter className="px-5 pb-5 pt-0 flex flex-col gap-2 border-t pt-4">
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="w-full rounded-lg border-transparent text-[#AE8F65] bg-[#AE8F65]/10 hover:bg-[#AE8F65]/20 hover:text-[#AE8F65] font-medium shadow-none cursor-pointer text-xs h-8"
                >
                  <Link href={`/shelters/${shelter.id}`} className="gap-1.5 justify-center w-full">
                    <EyeIcon className="size-3.5" />
                    View
                  </Link>
                </Button>
                <div className="grid grid-cols-2 gap-2 w-full">
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="rounded-lg border-border  hover:text-neutral-900 font-medium shadow-none cursor-pointer text-xs h-8 justify-center"
                  >
                    <Link href={`/shelters/${shelter.id}/edit`} className="gap-1">
                      <PencilIcon className="size-3.5" />
                      Edit
                    </Link>
                  </Button>
                  <ShelterStatusActions
                    shelterId={shelter.id}
                    isActive={shelter.isActive}
                    size="sm"
                    className="rounded-lg shadow-none font-medium h-8 text-xs cursor-pointer bg-red-400 text-white border-transparent w-full justify-center"
                  />
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-16 text-center border border-dashed rounded-xl bg-muted/10">
          <div className="bg-muted/40 p-4 rounded-full text-muted-foreground mb-4">
            <InboxIcon className="size-8 opacity-60" />
          </div>
          <h4 className="font-semibold text-lg text-foreground mb-1">No shelters found</h4>
          <p className="text-sm text-muted-foreground max-w-xs">
            {searchQuery
              ? "We couldn't find any shelters matching your search terms. Try refining your query."
              : "There are no shelters in this category currently."}
          </p>
        </div>
      )}
    </div>
  )
}
