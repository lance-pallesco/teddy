import "server-only"

import { randomUUID } from "crypto"
import { mkdir, writeFile } from "fs/promises"
import path from "path"

import {
  IMAGE_TYPE_TO_EXTENSION,
  AVATAR_PUBLIC_PREFIX,
  AVATAR_UPLOAD_DIR,
  type AllowedImageType,
} from "@/lib/uploads/constants"
import { validateImageFile } from "@/lib/uploads/validate-image-file"

export async function saveAvatar(file: File): Promise<string> {
  const validationError = validateImageFile(file)

  if (validationError) {
    throw new Error(validationError)
  }

  const mimeType = file.type as AllowedImageType
  const extension = IMAGE_TYPE_TO_EXTENSION[mimeType]
  const filename = `${randomUUID()}${extension}`
  const uploadDir = path.join(
    /* turbopackIgnore: true */ process.cwd(),
    AVATAR_UPLOAD_DIR
  )

  await mkdir(uploadDir, { recursive: true })

  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(path.join(uploadDir, filename), buffer)

  return `${AVATAR_PUBLIC_PREFIX}/${filename}`
}
