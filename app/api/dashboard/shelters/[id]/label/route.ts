import { NextResponse } from "next/server"

import { getCurrentUser } from "@/lib/auth/session"
import { getShelterNameById } from "@/lib/services/shelter.service"

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const { id } = await context.params
  const shelterName = await getShelterNameById(id)

  if (!shelterName) {
    return NextResponse.json({ message: "Not found" }, { status: 404 })
  }

  return NextResponse.json({ label: shelterName })
}
