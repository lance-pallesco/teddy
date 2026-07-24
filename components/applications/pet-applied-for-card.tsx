"use client"

import React from "react"
import Image from "next/image"
import { Building2, PawPrint, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PET_SPECIES_LABELS, PET_GENDER_LABELS } from "@/lib/constants/pet"
import { cn } from "@/lib/utils"

interface PetAppliedForCardProps {
  pet: {
    id: string
    name: string
    species: string
    breed?: string | null
    gender?: string | null
    size?: string
    petImages?: { id: string; url: string; isPrimary?: boolean }[]
    shelter?: {
      id: string
      name: string
      city: string
      province: string
      logo?: string | null
    } | null
    postedBy?: {
      id: string
      firstName: string
      lastName: string
      avatar?: string | null
    } | null
  }
  className?: string
}

export function PetAppliedForCard({ pet, className }: PetAppliedForCardProps) {
  if (!pet) return null

  const primaryImage =
    pet.petImages?.find((img) => img.isPrimary)?.url ?? pet.petImages?.[0]?.url ?? null

  const speciesLabel = (PET_SPECIES_LABELS as any)[pet.species] || pet.species || "Pet"
  const genderLabel = pet.gender ? ((PET_GENDER_LABELS as any)[pet.gender] || pet.gender) : "Unknown"
  const breedLabel = pet.breed?.trim() || "Mixed breed"
  const sizeLabel = pet.size ? pet.size.toLowerCase().replace("_", " ") : "Medium"
  const attributionLabel = pet.shelter
    ? pet.shelter.name
    : pet.postedBy
      ? `${pet.postedBy.firstName} ${pet.postedBy.lastName}`
      : "Private Poster"

  return (
    <Card className={cn("overflow-hidden border-primary/15 bg-card shadow-xs", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Pet Applied For
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border bg-muted shadow-xs">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={pet.name}
              fill
              className="object-cover"
              sizes="380px"
              unoptimized={primaryImage.startsWith("/uploads/")}
            />
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
              <PawPrint className="size-10 opacity-60" />
              <span className="text-xs font-medium">No photo</span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-bold tracking-tight text-foreground">{pet.name}</h3>
          <p className="text-xs font-semibold text-muted-foreground">
            {speciesLabel} • {breedLabel}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 pt-1 text-xs text-muted-foreground">
            <span><strong>Gender:</strong> {genderLabel}</span>
            <span><strong>Size:</strong> {sizeLabel}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t pt-3 text-xs text-foreground">
          {pet.shelter ? (
            <div className="relative size-9 shrink-0 overflow-hidden rounded-full border bg-muted flex items-center justify-center">
              {pet.shelter.logo ? (
                <Image
                  src={pet.shelter.logo}
                  alt={pet.shelter.name}
                  fill
                  className="object-cover"
                  unoptimized={pet.shelter.logo.startsWith("/uploads/")}
                />
              ) : (
                <Building2 className="size-4 text-primary" />
              )}
            </div>
          ) : (
            <div className="relative size-9 shrink-0 overflow-hidden rounded-full border bg-muted flex items-center justify-center">
              {pet.postedBy?.avatar ? (
                <Image
                  src={pet.postedBy.avatar}
                  alt={attributionLabel}
                  fill
                  className="object-cover"
                  unoptimized={pet.postedBy.avatar.startsWith("/uploads/")}
                />
              ) : (
                <span className="text-xs font-bold text-muted-foreground">
                  {pet.postedBy ? `${pet.postedBy.firstName.charAt(0)}${pet.postedBy.lastName.charAt(0)}`.toUpperCase() : <User className="size-4 text-primary" />}
                </span>
              )}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-foreground">{attributionLabel}</p>
            <p className="text-[11px] text-muted-foreground">
              {pet.shelter ? `${pet.shelter.city}, ${pet.shelter.province}` : "Individual Foster"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
