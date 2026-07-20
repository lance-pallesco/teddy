import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { SignJWT } from "jose"

import { getGoogleUser } from "@/lib/auth/google"
import { prisma } from "@/lib/prisma"
import { signAuthToken, getAuthCookieOptions, AUTH_COOKIE_NAME } from "@/lib/auth/jwt"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  if (error || !code) {
    console.error("Google OAuth error parameter:", error)
    return NextResponse.redirect(`${appUrl}/login?error=google_denied`)
  }

  try {
    // 1. Fetch user info from Google
    const googleUser = await getGoogleUser(code)

    if (!googleUser.email_verified) {
      return NextResponse.redirect(`${appUrl}/login?error=email_not_verified`)
    }

    // 2. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: googleUser.email },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        shelterId: true,
        isActive: true,
      },
    })

    if (existingUser) {
      if (!existingUser.isActive) {
        return NextResponse.redirect(`${appUrl}/login?error=account_deactivated`)
      }

      // 3. User exists: Log them in and redirect to dashboard
      const token = await signAuthToken({
        userId: existingUser.id,
        role: existingUser.role,
        firstName: existingUser.firstName,
        shelterId: existingUser.shelterId,
      })

      const response = NextResponse.redirect(`${appUrl}/dashboard`)
      
      const cookieStore = await cookies()
      cookieStore.set(AUTH_COOKIE_NAME, token, getAuthCookieOptions())

      return response
    }

    // 4. User does not exist: Create temporary signed registration state
    const signUpPayload = {
      email: googleUser.email,
      firstName: googleUser.firstName,
      lastName: googleUser.lastName,
      avatar: googleUser.avatar,
    }

    const secret = process.env.JWT_SECRET ?? process.env.AUTH_SECRET
    if (!secret) {
      throw new Error("JWT_SECRET or AUTH_SECRET must be configured")
    }

    const tempToken = await new SignJWT(signUpPayload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("600s") 
      .sign(new TextEncoder().encode(secret))

    const response = NextResponse.redirect(`${appUrl}/complete-profile`)
    
    const cookieStore = await cookies()
    cookieStore.set("oauth_signup_state", tempToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 600,
    })

    return response
  } catch (err) {
    console.error("Error handling Google OAuth callback:", err)
    return NextResponse.redirect(`${appUrl}/login?error=oauth_failed`)
  }
}

export const dynamic = "force-dynamic"
