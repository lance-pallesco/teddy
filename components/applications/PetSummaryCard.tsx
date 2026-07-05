"use client"

import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PetStatusBadge } from "@/components/pets/pet-status-badge"
import { PET_GENDER_LABELS, PET_SPECIES_LABELS } from "@/lib/constants/pet"
import { PawPrintIcon, User2Icon, Building2Icon } from "lucide-react"
import type { PetDetail } from "@/lib/services/pet.service"

interface PetSummaryCardProps {
  pet: PetDetail
}

export function PetSummaryCard({ pet }: PetSummaryCardProps) {
  const primaryImage = pet.images.find((img) => img.isPrimary)?.url ?? pet.images[0]?.url

  const ageLabel = pet.ageLabel
  const speciesLabel = PET_SPECIES_LABELS[pet.species]
  const genderLabel = pet.gender ? PET_GENDER_LABELS[pet.gender] : "Unknown"
  const breedLabel = pet.breed?.trim() || "Mixed breed"

  const attributionLabel = pet.shelter
    ? pet.shelter.name
    : pet.postedBy
      ? `${pet.postedBy.firstName} ${pet.postedBy.lastName}`
      : "Private Poster"

  return (
    <Card className="lg:sticky lg:top-6 border-primary/15 bg-muted/20 overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
          Applying For
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Photo */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted border">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={pet.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 30vw"
              unoptimized={primaryImage.startsWith("/uploads/")}
            />
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
              <PawPrintIcon className="size-10 opacity-60" />
              <span className="text-xs">No photo</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xl font-bold tracking-tight">{pet.name}</h3>
            <PetStatusBadge status={pet.status} />
          </div>

          <p className="text-sm font-medium text-foreground/80">
            {speciesLabel} &bull; {breedLabel}
          </p>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1">
            <span>
              <strong>Age:</strong> {ageLabel}
            </span>
            <span>
              <strong>Gender:</strong> {genderLabel}
            </span>
            <span>
              <strong>Size:</strong> {pet.size.toLowerCase().replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Attribution */}
        <div className="flex items-center gap-2 border-t pt-3 text-sm text-foreground/90">
          {pet.shelter ? (
            <Building2Icon className="size-4 text-primary shrink-0" />
          ) : (
            <User2Icon className="size-4 text-primary shrink-0" />
          )}
          <div className="min-w-0">
            <p className="font-semibold truncate">{attributionLabel}</p>
            <p className="text-xs text-muted-foreground">
              {pet.shelter ? "Rescuer Shelter" : "Individual Foster"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
