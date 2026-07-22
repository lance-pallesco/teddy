"use client"

import { useState } from "react"
import Link from "next/link"
import { ClipboardListIcon, HeartIcon, PencilIcon, RotateCcwIcon } from "lucide-react"
import { toast } from "sonner"

import { UpdatePetStatusDialog } from "@/components/pets/pet-status"
import { AdoptionCommitmentDialog } from "@/components/applications/adoption-commitment-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { PetDetail } from "@/lib/services/pet.service"
import { canManagePet } from "@/lib/utils/pet-permissions"
import type { Role } from "@prisma/client"

type Viewer = {
  id: string
  role: Role
  shelterId: string | null
} | null

type PetActionPanelProps = {
  pet: Pick<PetDetail, "id" | "name" | "status" | "postedById" | "shelterId">
  viewer: Viewer
  existingApplication?: {
    id: string
    status: string
  } | null
}

function comingSoon(message: string) {
  toast.message(message, {
    description: "This workflow will be available in an upcoming release.",
  })
}

export function PetActionPanel({
  pet,
  viewer,
  existingApplication,
}: PetActionPanelProps) {
  const [showCommitment, setShowCommitment] = useState(false)
  const canManage = viewer ? canManagePet(pet, viewer) : false
  const isAdopter = viewer?.role === "ADOPTER"
  const isArchived = pet.status === "ARCHIVED"

  const isRejected = existingApplication?.status === "REJECTED"
  const isDraft = existingApplication?.status === "DRAFT"
  const hasActiveApp = !!existingApplication && !isDraft && !isRejected

  return (
    <Card className="border-primary/20 bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Adoption actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {!viewer ? (
          <Button asChild size="lg" className="w-full rounded-lg bg-[#AE8F65] text-white border-transparent hover:bg-[#9A7D58] hover:text-white cursor-pointer font-medium shadow-none">
            <Link href="/login">
              <HeartIcon />
              Login to apply
            </Link>
          </Button>
        ) : null}

        {viewer && isAdopter && !isArchived ? (
          isRejected ? (
            <div className="space-y-2 p-3.5 rounded-xl border border-red-200 bg-red-50/50">
              <Badge variant="danger" className="w-fit">
                Application Declined
              </Badge>
              <p className="text-xs text-red-700 leading-normal">
                Your previous application for <strong>{pet.name}</strong> was declined by the shelter/owner. Re-applying for the same pet is not allowed.
              </p>
            </div>
          ) : hasActiveApp ? (
            <div className="space-y-2">
              <Badge variant="warning" className="w-fit">
                Application {existingApplication.status.replace("_", " ")}
              </Badge>
              <Button
                variant="outline"
                size="lg"
                className="w-full rounded-lg cursor-pointer"
                asChild
              >
                <Link href={`/applications/${existingApplication.id}`}>
                  <ClipboardListIcon className="size-4 mr-2" />
                  View Application
                </Link>
              </Button>
            </div>
          ) : isDraft ? (
            <Button
              size="lg"
              className="w-full rounded-lg bg-[#AE8F65] text-white border-transparent hover:bg-[#9A7D58] hover:text-white cursor-pointer font-medium shadow-none"
              asChild
            >
              <Link href={`/pets/${pet.id}/apply`}>
                <HeartIcon />
                Resume Draft Application
              </Link>
            </Button>
          ) : (
            <>
              <Button
                size="lg"
                onClick={() => setShowCommitment(true)}
                className="w-full rounded-lg bg-[#AE8F65] text-white border-transparent hover:bg-[#9A7D58] hover:text-white cursor-pointer font-medium shadow-none"
              >
                <HeartIcon />
                Apply to adopt
              </Button>

              <AdoptionCommitmentDialog
                open={showCommitment}
                onOpenChange={setShowCommitment}
                petId={pet.id}
                petName={pet.name}
              />
            </>
          )
        ) : null}

        {viewer && canManage ? (
          <>
            {isArchived ? (
              <Badge variant="secondary" className="w-fit">
                This listing is archived
              </Badge>
            ) : null}
            <Button size="lg" className="w-full rounded-lg bg-[#AE8F65] text-white border-transparent hover:bg-[#9A7D58] hover:text-white hover:border-[#9A7D58] cursor-pointer font-medium shadow-none" asChild>
              <Link href={`/pets/${pet.id}/edit`}>
                <PencilIcon className="size-4 mr-2" />
                Edit pet
              </Link>
            </Button>
              <UpdatePetStatusDialog petId={pet.id} petName={pet.name} isArchived={isArchived} />
          </>
        ) : null}

        {viewer && !isAdopter && !canManage ? (
          <p className="text-sm text-muted-foreground">
            Browse this listing for adoption details. Management actions are limited to
            the poster or shelter staff.
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
