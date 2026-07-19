"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import {
  SearchIcon,
  InboxIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  UserCheckIcon,
  UserXIcon,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toggleUserStatusAction } from "@/app/(dashboard)/users/actions/toggle-user-status"
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog"

type Role = "ADMIN" | "SHELTER_STAFF" | "PET_OWNER" | "ADOPTER"

type UserListItem = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  avatar: string
  role: Role
  isActive: boolean
  createdAt: Date
  shelter?: {
    name: string
  } | null
}

interface UsersClientProps {
  initialUsers: UserListItem[]
}

type TabType = "all" | "ADOPTER" | "PET_OWNER" | "SHELTER_STAFF"

export function UsersClient({ initialUsers }: UsersClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<TabType>("all")
  const [confirmUser, setConfirmUser] = useState<UserListItem | null>(null)
  const [isPending, startTransition] = useTransition()

  const filteredUsers = initialUsers.filter((user) => {
    if (activeTab !== "all" && user.role !== activeTab) {
      return false
    }

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      const matchesName = `${user.firstName} ${user.lastName}`
        .toLowerCase()
        .includes(query)
      const matchesEmail = user.email.toLowerCase().includes(query)
      const matchesPhone = user.phone.includes(query)
      const matchesAddress = user.address.toLowerCase().includes(query)
      const matchesShelter = user.shelter?.name.toLowerCase().includes(query)
      return matchesName || matchesEmail || matchesPhone || matchesAddress || matchesShelter
    }

    return true
  })

  const roleLabel = (role: Role) => {
    switch (role) {
      case "SHELTER_STAFF":
        return "Shelter Staff"
      case "PET_OWNER":
        return "Pet Owner"
      case "ADOPTER":
        return "Adopter"
      default:
        return role
    }
  }

  const roleVariant = (role: Role) => {
    switch (role) {
      case "SHELTER_STAFF":
        return "default"
      case "PET_OWNER":
        return "warning"
      case "ADOPTER":
        return "success"
      default:
        return "outline"
    }
  }

  function handleToggle(userId: string) {
    startTransition(async () => {
      const response = await toggleUserStatusAction(userId)
      if (response.success) {
        toast.success(response.message)
      } else {
        toast.error(response.message)
      }
    })
  }

  const tabOptions = [
    { id: "all" as const, label: `All Users (${initialUsers.length})` },
    {
      id: "ADOPTER" as const,
      label: `Adopters (${initialUsers.filter((u) => u.role === "ADOPTER").length})`,
    },
    {
      id: "PET_OWNER" as const,
      label: `Pet Owners (${initialUsers.filter((u) => u.role === "PET_OWNER").length})`,
    },
    {
      id: "SHELTER_STAFF" as const,
      label: `Shelter Staff (${initialUsers.filter((u) => u.role === "SHELTER_STAFF").length})`,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Search and Role Tabs Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2">
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, phone, or shelter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white dark:bg-[#1E1A16]"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex gap-1 rounded-lg border bg-[#8B7E74]/10 p-1 w-fit shadow-none overflow-x-auto max-w-full">
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

      {/* Cards Grid */}
      {filteredUsers.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredUsers.map((user) => (
            <Card
              key={user.id}
              className={cn(
                "relative overflow-hidden border-primary/10 hover:shadow-md transition-shadow duration-200 bg-white flex flex-col justify-between",
                !user.isActive && "opacity-80 border-dashed"
              )}
            >
              <div>
                <CardContent className="p-5 space-y-4">
                  {/* Absolute positioned small toggle button in top right */}
                  <div className="absolute top-3.5 right-3.5 z-10">
                    <Button
                      variant="outline"
                      size="icon-xs"
                      disabled={isPending}
                      onClick={() => setConfirmUser(user)}
                      className={cn(
                        "rounded-lg transition-colors cursor-pointer shadow-none border-transparent h-8 w-8",
                        user.isActive
                          ? "bg-red-500/10 hover:bg-red-500/20 text-red-600"
                          : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600"
                      )}
                      title={user.isActive ? "Deactivate User" : "Activate User"}
                    >
                      {user.isActive ? (
                        <UserXIcon className="size-4" />
                      ) : (
                        <UserCheckIcon className="size-4" />
                      )}
                    </Button>
                  </div>

                  {/* Top user profile header */}
                  <div className="flex items-center gap-3 pr-8">
                    <div className="relative size-12 rounded-full border bg-muted overflow-hidden shrink-0 flex items-center justify-center">
                      {user.avatar ? (
                        <Image
                          src={user.avatar}
                          alt={`${user.firstName} ${user.lastName}`}
                          fill
                          className="object-cover"
                          sizes="48px"
                          unoptimized={user.avatar.startsWith("/uploads/")}
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-muted-foreground bg-primary/5 text-primary text-sm font-bold">
                          {user.firstName[0]}
                          {user.lastName[0]}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-bold text-base text-[#3D3C3A] leading-tight truncate">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Member since {new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(new Date(user.createdAt))}
                      </p>
                    </div>
                  </div>

                  {/* Info lines */}
                  <div className="space-y-1.5 text-xs text-muted-foreground pt-1">
                    <div className="flex items-center gap-2 truncate" title={user.email}>
                      <MailIcon className="size-3.5 shrink-0 text-muted-foreground/60" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <PhoneIcon className="size-3.5 shrink-0 text-muted-foreground/60" />
                      <span>{user.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate" title={user.address}>
                      <MapPinIcon className="size-3.5 shrink-0 text-muted-foreground/60" />
                      <span className="truncate">{user.address}</span>
                    </div>
                  </div>

                  {/* Role Badges & Status */}
                  <div className="flex items-center justify-between gap-2 border-t pt-3">
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <Badge variant={roleVariant(user.role)} className="w-fit text-[10px]">
                        {roleLabel(user.role)}
                      </Badge>
                      {user.role === "SHELTER_STAFF" && user.shelter && (
                        <span
                          className="text-[10px] text-muted-foreground truncate max-w-32 font-medium"
                          title={user.shelter.name}
                        >
                          {user.shelter.name}
                        </span>
                      )}
                    </div>

                    <Badge
                      variant={user.isActive ? "success" : "warning"}
                      className="text-[10px] shrink-0"
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-16 text-center border border-dashed rounded-xl bg-muted/10">
          <div className="bg-muted/40 p-4 rounded-full text-muted-foreground mb-4">
            <InboxIcon className="size-8 opacity-60" />
          </div>
          <h4 className="font-semibold text-lg text-foreground mb-1">No users found</h4>
          <p className="text-sm text-muted-foreground max-w-xs">
            {searchQuery
              ? "We couldn't find any users matching your criteria. Try adjusting your search query."
              : "There are no users in this tab classification."}
          </p>
        </div>
      )}
      <ConfirmationDialog
        isOpen={!!confirmUser}
        onClose={() => setConfirmUser(null)}
        onConfirm={() => {
          if (confirmUser) {
            handleToggle(confirmUser.id)
            setConfirmUser(null)
          }
        }}
        title={confirmUser?.isActive ? "Deactivate Account?" : "Activate Account?"}
        description={
          confirmUser?.isActive
            ? `Are you sure you want to deactivate ${confirmUser?.firstName} ${confirmUser?.lastName}'s account? They will lose access to the platform until reactivated.`
            : `Are you sure you want to activate ${confirmUser?.firstName} ${confirmUser?.lastName}'s account? They will immediately regain access to the platform.`
        }
        confirmText={confirmUser?.isActive ? "Deactivate" : "Activate"}
        variant={confirmUser?.isActive ? "destructive" : "info"}
        isLoading={isPending}
      />
    </div>
  )
}
