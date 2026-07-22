"use client"

import { useMemo, useTransition, useState } from "react"
import { toast } from "sonner"

import { toggleShelterStatusAction } from "@/app/(dashboard)/shelters/actions/toggle-shelter-status"
import { Button } from "@/components/ui/button"
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog"

type ShelterStatusActionsProps = {
  shelterId: string
  isActive: boolean
  size?: "default" | "sm" | "xs" | "lg" | "icon" | "icon-sm" | "icon-xs"
  variant?: "outline" | "ghost" | "default" | "destructive" | "success"
  className?: string
}

export function ShelterStatusActions({
  shelterId,
  isActive,
  size = "default",
  variant,
  className,
}: ShelterStatusActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const actionLabel = useMemo(
    () => (isActive ? "Deactivate" : "Activate"),
    [isActive]
  )

  const dialogTitle = useMemo(
    () => (isActive ? "Deactivate this shelter?" : "Activate this shelter?"),
    [isActive]
  )

  const dialogDescription = useMemo(() => {
    if (!isActive) {
      return "Activating this shelter will restore staff access and allow its pets to appear in future public browsing."
    }

    return "Deactivating this shelter will hide its pets from public browsing and prevent shelter staff access."
  }, [isActive])

  function onConfirm() {
    startTransition(async () => {
      const result = await toggleShelterStatusAction({ shelterId })

      if (!result.success) {
        toast.error(result.message)
        return
      }

      toast.success(result.message)
      setIsOpen(false)
    })
  }

  return (
    <>
      <Button
        type="button"
        variant={variant ?? (isActive ? "destructive" : "success")}
        size={size}
        disabled={isPending}
        className={className}
        onClick={() => setIsOpen(true)}
      >
        {isPending ? "Updating..." : actionLabel}
      </Button>

      <ConfirmationDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={onConfirm}
        title={dialogTitle}
        description={dialogDescription}
        confirmText={actionLabel}
        variant={isActive ? "destructive" : "success"}
        isLoading={isPending}
      />
    </>
  )
}
