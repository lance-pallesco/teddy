"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import Image from "next/image"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { discardDraftAction } from "@/app/(dashboard)/applications/actions/application.action"
import { ArrowRightIcon, TrashIcon, Loader2Icon, PawPrintIcon } from "lucide-react"
import { PET_SPECIES_LABELS } from "@/lib/constants/pet"
import type { PetSpecies } from "@prisma/client"

interface ClientDraft {
  id: string
  petId: string
  petName: string
  petBreed: string
  petSpecies: string
  petPhotoUrl: string | null
  updatedAt: string
  currentStep: number
}

interface DraftsListClientProps {
  initialDrafts: ClientDraft[]
}

export function DraftsListClient({ initialDrafts }: DraftsListClientProps) {
  const [drafts, setDrafts] = useState<ClientDraft[]>(initialDrafts)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleDiscard = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to discard your draft application for ${name}?`)) {
      return
    }

    setDeletingId(id)
    startTransition(async () => {
      try {
        const res = await discardDraftAction(id)
        if (res.success) {
          setDrafts((prev) => prev.filter((d) => d.id !== id))
          toast.success("Draft application discarded.")
        } else {
          toast.error(res.error ?? "Failed to discard draft.")
        }
      } catch (err) {
        console.error(err)
        toast.error("An error occurred.")
      } finally {
        setDeletingId(null)
      }
    })
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {drafts.map((draft) => {
        const speciesLabel = PET_SPECIES_LABELS[draft.petSpecies as PetSpecies] ?? draft.petSpecies
        const isDeleting = deletingId === draft.id

        return (
          <Card key={draft.id} className="overflow-hidden border border-primary/10 hover:shadow-md transition-shadow">
            <CardContent className="p-0 flex flex-col h-full">
              {/* Pet Image Header */}
              <div className="relative aspect-[16/9] w-full bg-muted border-b">
                {draft.petPhotoUrl ? (
                  <Image
                    src={draft.petPhotoUrl}
                    alt={draft.petName}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    unoptimized={draft.petPhotoUrl.startsWith("/uploads/")}
                  />
                ) : (
                  <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground bg-muted/40">
                    <PawPrintIcon className="size-8 opacity-40" />
                    <span className="text-xs">No photo</span>
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold truncate text-foreground">
                    {draft.petName}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {speciesLabel} &bull; {draft.petBreed}
                  </p>
                  <div className="pt-2 text-xs space-y-1 text-muted-foreground">
                    <p>
                      <strong>Progress:</strong> Step {draft.currentStep} of 7
                    </p>
                    <p>
                      <strong>Last saved:</strong> {formatDate(draft.updatedAt)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={isPending}
                    onClick={() => handleDiscard(draft.id, draft.petName)}
                    className="text-destructive hover:bg-destructive/10 shrink-0 h-9 w-9"
                    title="Discard Draft"
                  >
                    {isDeleting ? (
                      <Loader2Icon className="size-4 animate-spin" />
                    ) : (
                      <TrashIcon className="size-4" />
                    )}
                  </Button>

                  <Button asChild size="sm" className="flex-1 h-9" disabled={isPending}>
                    <Link href={`/pets/${draft.petId}/apply`}>
                      Resume
                      <ArrowRightIcon className="size-4 ml-1.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
