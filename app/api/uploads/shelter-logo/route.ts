import { NextResponse } from "next/server"

import { getCurrentUser } from "@/lib/auth/session"
import { saveShelterLogo } from "@/lib/uploads/save-shelter-logo"

export async function POST(request: Request) {
  const user = await getCurrentUser()

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get("file")

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No image file provided." }, { status: 400 })
  }

  try {
    const url = await saveShelterLogo(file)
    return NextResponse.json({ url })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Logo upload failed. Please try again."

    return NextResponse.json({ error: message }, { status: 400 })
  }
}
