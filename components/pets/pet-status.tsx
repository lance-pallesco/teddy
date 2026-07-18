"use client"

import { useRouter } from "next/navigation"
import { useTransition, useState } from "react"
import { ArchiveIcon, RotateCcwIcon } from "lucide-react"
import { toast } from "sonner"

import { togglePetStatusAction } from "@/app/(dashboard)/pets/actions/pet.actions"
import { Button } from "@/components/ui/button"
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog"

type UpdatePetStatusDialogProps = {
  petId: string
  petName: string
  isArchived: boolean
  disabled?: boolean
}

export function UpdatePetStatusDialog({ petId, petName, isArchived, disabled }: UpdatePetStatusDialogProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleUpdateStatus() {
    startTransition(async () => {
      const response = await togglePetStatusAction(petId, !isArchived)

      if (!response.success) {
        toast.error(response.message)
        return
      }

      toast.success(response.message)
      setIsOpen(false)
      router.push(`/pets?tab=${isArchived ? "archived" : "active"}`)
      router.refresh()
    })
  }

  const actionText = isArchived ? "Restore" : "Archive"

  const dialogDescription = isArchived ? (
    `This will make ${petName} visible in public listings and available for adoption applications again.`
  ) : (
    `This pet will be hidden from listings and public browsing. Existing adoption records will be preserved.`
  )

  return (
    <>
      <Button
        size="lg"
        className={`w-full border rounded-lg ${
          isArchived
            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30"
            : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:text-amber-800 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30"
        } cursor-pointer font-medium shadow-none`}
        disabled={disabled || isPending}
        onClick={() => setIsOpen(true)}
      >
        {isArchived ? <RotateCcwIcon className="size-4 mr-2" /> : <ArchiveIcon className="size-4 mr-2" />}
        {isArchived ? "Restore pet" : "Archive pet"}
      </Button>

      <ConfirmationDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleUpdateStatus}
        title={`${actionText} ${petName}?`}
        description={dialogDescription}
        confirmText={actionText}
        variant={isArchived ? "success" : "warning"}
        isLoading={isPending}
      />
    </>
  )
}
