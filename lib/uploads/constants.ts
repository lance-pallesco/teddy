export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const

export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number]

export const IMAGE_TYPE_TO_EXTENSION: Record<AllowedImageType, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
}

export const SHELTER_LOGO_UPLOAD_DIR = "public/uploads/shelters"
export const SHELTER_LOGO_PUBLIC_PREFIX = "/uploads/shelters"

export const PET_IMAGE_UPLOAD_DIR = "public/uploads/pets"
export const PET_IMAGE_PUBLIC_PREFIX = "/uploads/pets"
