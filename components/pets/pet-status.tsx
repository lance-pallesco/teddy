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
        <Button
          size="lg"
          className={`w-full border rounded-lg ${
            isArchived
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30"
              : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:text-amber-800 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30"
          } cursor-pointer font-medium`}
          disabled={disabled || isPending}
        >
          {isArchived ? <RotateCcwIcon className="size-4 mr-2" /> : <ArchiveIcon className="size-4 mr-2" />}
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
