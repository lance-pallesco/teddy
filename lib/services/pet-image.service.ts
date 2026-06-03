import "server-only"

import { prisma } from "@/lib/prisma"
import { MAX_PET_IMAGES } from "@/lib/constants/pet"

export class PetImageValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "PetImageValidationError"
  }
}

export function validatePetImageUrls(imageUrls: string[]): string[] {
  const uniqueUrls = [...new Set(imageUrls.map((url) => url.trim()).filter(Boolean))]

  if (uniqueUrls.length > MAX_PET_IMAGES) {
    throw new PetImageValidationError(`A pet can have at most ${MAX_PET_IMAGES} images.`)
  }

  for (const url of uniqueUrls) {
    if (!url.startsWith("/uploads/pets/") && !/^https?:\/\//i.test(url)) {
      throw new PetImageValidationError("One or more image URLs are invalid.")
    }
  }

  return uniqueUrls
}

export async function createPetImages(petId: string, imageUrls: string[]) {
  const urls = validatePetImageUrls(imageUrls)

  if (urls.length === 0) {
    return []
  }

  return prisma.petImage.createManyAndReturn({
    data: urls.map((url, index) => ({
      petId,
      url,
      isPrimary: index === 0,
    })),
  })
}
