import "server-only"

import type { Prisma } from "@prisma/client"

import { MAX_PET_IMAGES } from "@/lib/constants/pet"
import { prisma } from "@/lib/prisma"
import { deletePetImageFile } from "@/lib/uploads/delete-pet-image"

export class PetImageValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "PetImageValidationError"
  }
}

export type PetPhotoInput = {
  imageId?: string
  url: string
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

function validatePetPhotos(photos: PetPhotoInput[]): PetPhotoInput[] {
  if (photos.length === 0) {
    throw new PetImageValidationError("A pet must have at least one photo.")
  }

  if (photos.length > MAX_PET_IMAGES) {
    throw new PetImageValidationError(`A pet can have at most ${MAX_PET_IMAGES} images.`)
  }

  for (const photo of photos) {
    const url = photo.url.trim()

    if (!url.startsWith("/uploads/pets/") && !/^https?:\/\//i.test(url)) {
      throw new PetImageValidationError("One or more image URLs are invalid.")
    }
  }

  return photos.map((photo) => ({
    imageId: photo.imageId,
    url: photo.url.trim(),
  }))
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

export async function syncPetImages(
  tx: Prisma.TransactionClient,
  petId: string,
  photos: PetPhotoInput[]
): Promise<string[]> {
  const validatedPhotos = validatePetPhotos(photos)
  const existing = await tx.petImage.findMany({
    where: { petId },
    select: { id: true, url: true },
  })

  const submittedExistingIds = new Set(
    validatedPhotos
      .map((photo) => photo.imageId)
      .filter((imageId): imageId is string => Boolean(imageId))
  )

  const deletedUrls: string[] = []

  for (const image of existing) {
    if (!submittedExistingIds.has(image.id)) {
      await tx.petImage.delete({ where: { id: image.id } })
      deletedUrls.push(image.url)
    }
  }

  for (let index = 0; index < validatedPhotos.length; index++) {
    const photo = validatedPhotos[index]
    const isPrimary = index === 0

    if (photo.imageId) {
      const belongsToPet = existing.some((image) => image.id === photo.imageId)

      if (!belongsToPet) {
        throw new PetImageValidationError("One or more photos could not be updated.")
      }

      await tx.petImage.update({
        where: { id: photo.imageId },
        data: {
          url: photo.url,
          isPrimary,
        },
      })
      continue
    }

    await tx.petImage.create({
      data: {
        petId,
        url: photo.url,
        isPrimary,
      },
    })
  }

  return deletedUrls
}

export async function deletePetImageFiles(urls: string[]) {
  await Promise.all(urls.map((url) => deletePetImageFile(url)))
}
