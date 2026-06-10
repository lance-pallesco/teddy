"use client"

import Link from "next/link"
import { ClipboardListIcon, HeartIcon, PencilIcon, RotateCcwIcon } from "lucide-react"
import { toast } from "sonner"

import { UpdatePetStatusDialog } from "@/components/pets/pet-status"
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
  /** Placeholder until adoption applications ship. */
  hasExistingApplication?: boolean
}

function comingSoon(message: string) {
  toast.message(message, {
    description: "This workflow will be available in an upcoming release.",
  })
}

export function PetActionPanel({
  pet,
  viewer,
  hasExistingApplication = false,
}: PetActionPanelProps) {
  const canManage = viewer ? canManagePet(pet, viewer) : false
  const isAdopter = viewer?.role === "ADOPTER"
  const isArchived = pet.status === "ARCHIVED"

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Adoption actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {!viewer ? (
          <Button asChild size="lg" className="w-full">
            <Link href="/login">
              <HeartIcon />
              Login to apply
            </Link>
          </Button>
        ) : null}

        {viewer && isAdopter && !isArchived ? (
          hasExistingApplication ? (
            <>
              <Badge variant="warning" className="w-fit">
                Application pending review
              </Badge>
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => comingSoon("View application")}
              >
                <ClipboardListIcon />
                View application
              </Button>
            </>
          ) : (
            <Button
              size="lg"
              className="w-full"
              onClick={() => comingSoon("Apply to adopt")}
            >
              <HeartIcon />
              Apply to adopt
            </Button>
          )
        ) : null}

        {viewer && canManage ? (
          <>
            {isArchived ? (
              <Badge variant="secondary" className="w-fit">
                This listing is archived
              </Badge>
            ) : null}
            <Button variant="outline" size="lg" className="w-full" asChild>
              <Link href={`/pets/${pet.id}/edit`}>
                <PencilIcon />
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
