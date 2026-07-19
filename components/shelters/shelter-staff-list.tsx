"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import { UsersIcon, UserCheckIcon, UserXIcon } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toggleUserStatusAction } from "@/app/(dashboard)/users/actions/toggle-user-status"
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog"

type StaffMember = {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  avatar: string
  isActive: boolean
}

type ShelterStaffListProps = {
  staffMembers: StaffMember[]
}

export function ShelterStaffList({ staffMembers }: ShelterStaffListProps) {
  const [confirmUser, setConfirmUser] = useState<StaffMember | null>(null)
  const [isPending, startTransition] = useTransition()

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

  if (staffMembers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed rounded-lg bg-muted/10">
        <UsersIcon className="size-10 text-muted-foreground opacity-40 mb-2" />
        <h5 className="font-semibold text-sm">No staff members assigned yet</h5>
        <p className="text-xs text-muted-foreground max-w-xs mt-0.5">
          Add a staff account to start shelter operations.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        {staffMembers.map((staff) => (
          <div
            key={staff.id}
            className="relative flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/10 transition-colors"
          >
            {/* Avatar on the left */}
            <div className="relative size-10 rounded-full bg-muted border overflow-hidden shrink-0">
              {staff.avatar ? (
                <Image
                  src={staff.avatar}
                  alt={`${staff.firstName} ${staff.lastName}`}
                  fill
                  className="object-cover"
                  sizes="40px"
                  unoptimized={staff.avatar.startsWith("/uploads/")}
                />
              ) : (
                <div className="flex size-full items-center justify-center text-muted-foreground bg-primary/5 text-primary text-xs font-bold">
                  {staff.firstName[0]}
                  {staff.lastName[0]}
                </div>
              )}
            </div>

            {/* Info details in the middle */}
            <div className="min-w-0 flex-1 flex flex-col pr-8">
              <h4 className="text-sm font-semibold text-foreground truncate">
                {staff.firstName} {staff.lastName}
              </h4>
              <p className="text-xs text-muted-foreground truncate">{staff.email}</p>
              
              {/* Green status badge at the bottom of email */}
              <Badge
                variant={staff.isActive ? "success" : "warning"}
                className={cn(
                  "text-[9px] uppercase tracking-wider font-semibold w-fit mt-1 shrink-0",
                  staff.isActive
                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                )}
              >
                {staff.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>

            {/* Deactivate/Activate icon button placed in the upper right corner */}
            <div className="absolute top-2 right-2">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "size-8 rounded-lg",
                  staff.isActive
                    ? "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    : "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                )}
                onClick={() => setConfirmUser(staff)}
                disabled={isPending}
              >
                {staff.isActive ? (
                  <UserXIcon className="size-4" />
                ) : (
                  <UserCheckIcon className="size-4" />
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Reusable confirmation modal */}
      <ConfirmationDialog
        isOpen={!!confirmUser}
        onClose={() => setConfirmUser(null)}
        title={confirmUser?.isActive ? "Deactivate Staff Account?" : "Activate Staff Account?"}
        description={
          confirmUser
            ? confirmUser.isActive
              ? `Are you sure you want to deactivate the staff account for ${confirmUser.firstName} ${confirmUser.lastName}? They will lose access to the platform until reactivated.`
              : `Are you sure you want to activate the staff account for ${confirmUser.firstName} ${confirmUser.lastName}? They will immediately regain access to the platform.`
            : ""
        }
        onConfirm={() => {
          if (confirmUser) {
            handleToggle(confirmUser.id)
            setConfirmUser(null)
          }
        }}
        confirmText={confirmUser?.isActive ? "Deactivate" : "Activate"}
        cancelText="Cancel"
        variant={confirmUser?.isActive ? "warning" : "success"}
      />
    </>
  )
}
