import type { PetAgeUnit, PetTemperament } from "@/lib/constants/pet"
import type { PetGender, PetSize, PetSpecies } from "@prisma/client"
import type { PetFormInput } from "@/lib/validations/pet"

export type PetEditSource = {
  id: string
  name: string
  description: string
  species: PetSpecies
  breed: string | null
  gender: PetGender | null
  size: PetSize
  birthDate: Date | null
  color: string | null
  weightKg: number | null
  tags: string[]
  goodWithKids: boolean
  goodWithDogs: boolean
  goodWithCats: boolean
  isHouseTrained: boolean
  specialNeeds: boolean
  specialNeedsNote: string | null
  images: {
    id: string
    url: string
    isPrimary: boolean
  }[]
}

function booleanToYesNo(value: boolean): "YES" | "NO" {
  return value ? "YES" : "NO"
}

export function birthDateToFormAge(birthDate: Date | null): {
  age: number
  ageUnit: PetAgeUnit
} {
  if (!birthDate) {
    return { age: 1, ageUnit: "YEARS" }
  }

  const now = new Date()
  let months =
    (now.getFullYear() - birthDate.getFullYear()) * 12 +
    (now.getMonth() - birthDate.getMonth())

  if (now.getDate() < birthDate.getDate()) {
    months -= 1
  }

  months = Math.max(0, months)

  if (months < 12) {
    return { age: Math.max(1, months), ageUnit: "MONTHS" }
  }

  return { age: Math.max(1, Math.floor(months / 12)), ageUnit: "YEARS" }
}

export function mapPetToFormValues(pet: PetEditSource): PetFormInput {
  const { age, ageUnit } = birthDateToFormAge(pet.birthDate)
  const orderedImages = [...pet.images].sort((a, b) => {
    if (a.isPrimary !== b.isPrimary) {
      return a.isPrimary ? -1 : 1
    }

    return 0
  })

  return {
    name: pet.name,
    species: pet.species,
    breed: pet.breed ?? "",
    age,
    ageUnit,
    gender: pet.gender ?? "MALE",
    size: pet.size,
    color: pet.color ?? "",
    weightKg: pet.weightKg ?? "",
    tags: pet.tags as PetTemperament[],
    goodWithKids: booleanToYesNo(pet.goodWithKids),
    goodWithDogs: booleanToYesNo(pet.goodWithDogs),
    goodWithCats: booleanToYesNo(pet.goodWithCats),
    isHouseTrained: booleanToYesNo(pet.isHouseTrained),
    specialNeeds: booleanToYesNo(pet.specialNeeds),
    specialNeedsNote: pet.specialNeedsNote ?? "",
    photos: orderedImages.map((image) => ({
      imageId: image.id,
      url: image.url,
    })),
    description: pet.description,
  }
}
