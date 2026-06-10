import type { Role } from "@prisma/client"

type PetOwnershipRef = {
  postedById: string | null
  shelterId: string | null
}

type ViewerContext = {
  id: string
  role: Role
  shelterId: string | null
}

export function canManagePet(pet: PetOwnershipRef, viewer: ViewerContext): boolean {
  if (viewer.role === "ADMIN") {
    return true
  }

  if (viewer.role === "PET_OWNER" && pet.postedById === viewer.id) {
    return true
  }

  if (
    viewer.role === "SHELTER_STAFF" &&
    pet.shelterId &&
    pet.shelterId === viewer.shelterId
  ) {
    return true
  }

  return false
}

export function isMixedBreedLabel(breed: string | null | undefined): boolean {
  if (!breed?.trim()) {
    return false
  }

  return /mixed/i.test(breed.trim())
}
