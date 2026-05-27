"use client"

import { useMemo, useTransition } from "react"
import { toast } from "sonner"

import { toggleShelterStatusAction } from "@/app/(dashboard)/shelters/actions/toggle-shelter-status"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type ShelterStatusActionsProps = {
  shelterId: string
  isActive: boolean
}

export function ShelterStatusActions({
  shelterId,
  isActive,
}: ShelterStatusActionsProps) {
  const [isPending, startTransition] = useTransition()

  const actionLabel = useMemo(
    () => (isActive ? "Deactivate Shelter" : "Activate Shelter"),
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
    })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant={isActive ? "destructive" : "success"}
          disabled={isPending}
        >
          {isPending ? "Updating..." : actionLabel}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{dialogTitle}</AlertDialogTitle>
          <AlertDialogDescription>{dialogDescription}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPending}
            className={isActive ? "" : ""}
          >
            {isPending ? "Please wait..." : actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

