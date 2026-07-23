"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Trash2Icon, Loader2Icon } from "lucide-react"
import { toast } from "sonner"

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
} from "@/components/ui/alert-dialog"
import { discardDraftAction } from "@/app/(dashboard)/applications/actions/application.action"

interface DeleteDraftButtonProps {
  applicationId: string
  petName: string
  variant?: "icon" | "button" | "text"
  className?: string
}

export function DeleteDraftButton({
  applicationId,
  petName,
  variant = "button",
  className,
}: DeleteDraftButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    startTransition(async () => {
      const res = await discardDraftAction(applicationId)
      if (res.success) {
        toast.success(`Draft application for ${petName} deleted.`)
        setOpen(false)
        router.refresh()
      } else {
        toast.error(res.error || "Failed to delete draft application.")
      }
    })
  }

  return (
    <>
      {variant === "icon" ? (
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setOpen(true)}
          className={`size-9 rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer shadow-xs ${className || ""}`}
          title="Delete draft"
        >
          <Trash2Icon className="size-4" />
        </Button>
      ) : variant === "text" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`text-xs font-semibold text-red-600 hover:text-red-700 hover:underline cursor-pointer ${className || ""}`}
        >
          Delete Draft
        </button>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
          className={`text-xs font-semibold rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer h-9 px-3.5 shadow-xs ${className || ""}`}
        >
          <Trash2Icon className="size-3.5 mr-1.5" />
          Delete Draft
        </Button>
      )}

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="rounded-2xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold">
              Delete Draft Application?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to delete your draft application for <strong>{petName}</strong>? This action cannot be undone and all saved progress for this pet will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel
              disabled={isPending}
              className="rounded-xl text-xs h-9 px-4 cursor-pointer"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              className="rounded-xl text-xs font-bold h-9 px-4 bg-red-600 hover:bg-red-700 text-white cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2Icon className="size-3.5 animate-spin mr-1.5" />
                  Deleting...
                </>
              ) : (
                "Delete Draft"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
