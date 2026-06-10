import { NextResponse } from "next/server"

import { getCurrentUser } from "@/lib/auth/session"
import { savePetImage } from "@/lib/uploads/save-pet-image"

const ALLOWED_ROLES = new Set(["SHELTER_STAFF", "PET_OWNER"])

export async function POST(request: Request) {
  const user = await getCurrentUser()

  if (!user || !ALLOWED_ROLES.has(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get("file")

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No image file provided." }, { status: 400 })
  }

  try {
    const url = await savePetImage(file)
    return NextResponse.json({ url })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Image upload failed. Please try again."

    return NextResponse.json({ error: message }, { status: 400 })
  }
}
