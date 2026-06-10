import {
  PET_GENDER_LABELS,
  PET_SIZE_OPTIONS,
  PET_SPECIES_LABELS,
  type PetAgeUnit,
} from "@/lib/constants/pet"
import type { PetGender, PetSize, PetSpecies } from "@prisma/client"

import { formatEstimatedAge } from "@/lib/utils/pet-age"

type BuildPetDescriptionInput = {
  name: string
  species: PetSpecies
  breed?: string | null
  age: number
  ageUnit: PetAgeUnit
  gender: PetGender
  size: PetSize
  color?: string | null
  tags: string[]
  goodWithKids: boolean
  goodWithDogs: boolean
  goodWithCats: boolean
  isHouseTrained: boolean
  specialNeeds: boolean
  specialNeedsNote?: string | null
}

function sizeLabel(size: PetSize): string {
  return PET_SIZE_OPTIONS.find((option) => option.value === size)?.label ?? size
}

export function buildDefaultPetDescription(input: BuildPetDescriptionInput): string {
  const breedLabel = input.breed?.trim() ? input.breed.trim() : "breed not specified"

  const traits: string[] = [
    `${input.name} is a ${formatEstimatedAge(input.age, input.ageUnit)} old ${PET_GENDER_LABELS[input.gender].toLowerCase()} ${PET_SPECIES_LABELS[input.species].toLowerCase()} (${breedLabel}), ${sizeLabel(input.size).toLowerCase()}.`,
  ]

  if (input.color?.trim()) {
    traits.push(`Color: ${input.color.trim()}.`)
  }

  if (input.tags.length > 0) {
    traits.push(`Temperament: ${input.tags.join(", ")}.`)
  }

  const compatibility: string[] = []

  if (input.goodWithKids) compatibility.push("kids")
  if (input.goodWithDogs) compatibility.push("dogs")
  if (input.goodWithCats) compatibility.push("cats")

  if (compatibility.length > 0) {
    traits.push(`Good with ${compatibility.join(", ")}.`)
  }

  if (input.isHouseTrained) {
    traits.push("House trained.")
  }

  if (input.specialNeeds) {
    traits.push(
      input.specialNeedsNote?.trim()
        ? `Special needs: ${input.specialNeedsNote.trim()}`
        : "Has special care needs — contact the poster for details."
    )
  }

  return traits.join(" ")
}
