import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  type AllowedImageType,
} from "@/lib/uploads/constants"

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as AllowedImageType)) {
    return "Please upload a JPEG, PNG, WebP, or GIF image."
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return "Image must be 10MB or smaller."
  }

  return null
}
