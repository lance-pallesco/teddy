import "server-only"

import { unlink } from "fs/promises"
import path from "path"

import { PET_IMAGE_PUBLIC_PREFIX, PET_IMAGE_UPLOAD_DIR } from "@/lib/uploads/constants"

export async function deletePetImageFile(publicUrl: string): Promise<void> {
  if (!publicUrl.startsWith(`${PET_IMAGE_PUBLIC_PREFIX}/`)) {
    return
  }

  const filename = publicUrl.slice(`${PET_IMAGE_PUBLIC_PREFIX}/`.length)

  if (!filename || filename.includes("..") || filename.includes("/")) {
    return
  }

  const filePath = path.join(
    /* turbopackIgnore: true */ process.cwd(),
    PET_IMAGE_UPLOAD_DIR,
    filename
  )

  try {
    await unlink(filePath)
  } catch {
    // File may already be removed; ignore missing file errors.
  }
}
