import type { LucideIcon } from "lucide-react"
import {
  CakeIcon,
  DnaIcon,
  PaletteIcon,
  PawPrintIcon,
  RulerIcon,
  ScaleIcon,
  UserIcon,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import {
  PET_GENDER_LABELS,
  PET_SIZE_LABELS,
  PET_SPECIES_LABELS,
} from "@/lib/constants/pet"
import type { PetDetail } from "@/lib/services/pet.service"
import type { PetGender, PetSize, PetSpecies } from "@prisma/client"

type PetAttributeGridProps = {
  pet: PetDetail
}

type AttributeItem = {
  label: string
  value: string
  icon: LucideIcon
}

function AttributeCard({ label, value, icon: Icon }: AttributeItem) {
  return (
    <Card className="border-border/80 bg-card/80 shadow-none">
      <CardContent className="flex items-start gap-3 p-3.5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {label}
          </p>
          <p className="mt-0.5 text-sm font-medium leading-snug">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function PetAttributeGrid({ pet }: PetAttributeGridProps) {
  const breedDisplay = pet.isMixedBreed
    ? pet.breed?.trim() || "Mixed breed"
    : pet.breed?.trim() || "Not specified"

  const items: AttributeItem[] = [
    {
      label: "Species",
      value: PET_SPECIES_LABELS[pet.species as PetSpecies],
      icon: PawPrintIcon,
    },
    {
      label: "Breed",
      value: breedDisplay,
      icon: DnaIcon,
    },
    {
      label: "Age",
      value: pet.ageLabel,
      icon: CakeIcon,
    },
    {
      label: "Size",
      value: PET_SIZE_LABELS[pet.size as PetSize],
      icon: RulerIcon,
    },
    {
      label: "Gender",
      value: pet.gender ? PET_GENDER_LABELS[pet.gender as PetGender] : "Not specified",
      icon: UserIcon,
    },
    {
      label: "Color",
      value: pet.color?.trim() || "Not specified",
      icon: PaletteIcon,
    },
    {
      label: "Weight",
      value: pet.weightLabel ?? "Not specified",
      icon: ScaleIcon,
    },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <AttributeCard key={item.label} {...item} />
      ))}
    </div>
  )
}
