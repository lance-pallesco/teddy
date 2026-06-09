"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { ArchiveIcon, RotateCcwIcon } from "lucide-react"
import { toast } from "sonner"

import { togglePetStatusAction } from "@/app/(dashboard)/pets/actions/pet.actions"
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
import { Button } from "@/components/ui/button"

type UpdatePetStatusDialogProps = {
  petId: string
  petName: string
  isArchived: boolean
  disabled?: boolean
}

export function UpdatePetStatusDialog({ petId, petName, isArchived, disabled }: UpdatePetStatusDialogProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleUpdateStatus() {
    startTransition(async () => {
      const response = await togglePetStatusAction(petId, !isArchived)

      if (!response.success) {
        toast.error(response.message)
        return
      }

      toast.success(response.message)
      router.push(`/pets?tab=${isArchived ? "archived" : "active"}`)
      router.refresh()
    })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="lg" className="w-full" disabled={disabled || isPending}>
          {isArchived ? <RotateCcwIcon/> : <ArchiveIcon />}
          {isArchived ? "Restore pet" : "Archive pet"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{isArchived ? "Restore" : "Archive"} {petName}?</AlertDialogTitle>
          <AlertDialogDescription>
            {isArchived ? (
              <>
                This will make {petName} visible in public listings and available for adoption applications again.
              </>
            ) : (
              <>
                This pet will be hidden from listings and public browsing. Existing adoption
                records will be preserved.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={isPending} onClick={handleUpdateStatus}>
             {isPending
              ? isArchived
                ? "Restoring..."
                : "Archiving..."
              : isArchived
              ? "Restore"
              : "Archive"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
