import { NextResponse } from "next/server"
import { getGoogleAuthUrl } from "@/lib/auth/google"

export async function GET() {
  try {
    const googleAuthUrl = getGoogleAuthUrl()
    return NextResponse.redirect(googleAuthUrl)
  } catch (error) {
    console.error("Error initiating Google OAuth redirect:", error)
    return NextResponse.json(
      { error: "Google OAuth is not configured on this server." },
      { status: 500 }
    )
  }
}
export const dynamic = "force-dynamic"
