import { MapPinIcon } from "lucide-react"

import { PetActionPanel } from "@/components/pets/pet-action-panel"
import { PetAttributeGrid } from "@/components/pets/pet-attribute-grid"
import { PetAttributionCard } from "@/components/pets/pet-attribution-card"
import { PetCompatibilityCard } from "@/components/pets/pet-compatibility-card"
import { PetGallery } from "@/components/pets/pet-gallery"
import { PetSpecialNeedsCard } from "@/components/pets/pet-special-needs-card"
import { PetStatusBadge } from "@/components/pets/pet-status-badge"
import { Badge } from "@/components/ui/badge"
import {
  PET_GENDER_LABELS,
  PET_SPECIES_LABELS,
  PET_SIZE_LABELS,
} from "@/lib/constants/pet"
import type { PetDetail } from "@/lib/services/pet.service"
import type { PetGender, PetSize, PetSpecies } from "@prisma/client"
import type { Role } from "@prisma/client"

type Viewer = {
  id: string
  role: Role
  shelterId: string | null
} | null

type PetDetailContentProps = {
  pet: PetDetail
  viewer: Viewer
  existingApplication?: {
    id: string
    status: string
  } | null
}

export function PetDetailContent({ pet, viewer, existingApplication }: PetDetailContentProps) {
  const speciesLabel = PET_SPECIES_LABELS[pet.species as PetSpecies]
  const subtitleParts = [
    speciesLabel,
    pet.isMixedBreed ? "Mixed breed" : pet.breed?.trim(),
    pet.gender ? PET_GENDER_LABELS[pet.gender as PetGender] : null,
    PET_SIZE_LABELS[pet.size as PetSize],
    pet.ageLabel,
  ].filter(Boolean)

  return (
    <div className="grid gap-8 lg:grid-cols-5 lg:gap-10">
      <div className="lg:col-span-3">
        <PetGallery petName={pet.name} images={pet.images} />
      </div>

      <div className="space-y-6 lg:col-span-2">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <PetStatusBadge status={pet.status} />
            {pet.isMixedBreed ? <Badge variant="outline">Mixed breed</Badge> : null}
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{pet.name}</h1>
          <p className="text-muted-foreground">{subtitleParts.join(" · ")}</p>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPinIcon className="size-4 shrink-0" />
            {pet.location}
          </p>
        </div>

        <PetActionPanel
          pet={pet}
          viewer={viewer}
          existingApplication={existingApplication}
        />

        <PetAttributionCard pet={pet} />

        {pet.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {pet.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>

      <div className="space-y-6 lg:col-span-5">
        <PetAttributeGrid pet={pet} />
        <PetCompatibilityCard pet={pet} />
        <PetSpecialNeedsCard pet={pet} />
        <section className="rounded-xl border bg-card p-5 md:p-6">
          <h2 className="text-lg font-semibold">About {pet.name}</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground md:text-base">
            {pet.description}
          </p>
        </section>
      </div>
    </div>
  )
}
