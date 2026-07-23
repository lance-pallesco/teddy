import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const AUTH_COOKIE_NAME = "teddy_session"

const guestRoutes = ["/login", "/signup"]
const protectedRoutes = ["/dashboard", "/applications", "/pets"]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value

  let isVerified = false
  if (token) {
    try {
      const secretKey = process.env.JWT_SECRET ?? process.env.AUTH_SECRET ?? ""
      if (secretKey) {
        const secret = new TextEncoder().encode(secretKey)
        await jwtVerify(token, secret)
        isVerified = true
      }
    } catch {
      isVerified = false
    }
  }

  // 1. Logged-in user visiting guest routes (/login, /signup) -> redirect to /dashboard
  if (guestRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`)) && isVerified) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // 2. Unauthenticated/expired user visiting protected routes -> redirect to /login
  if (protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`)) && !isVerified) {
    const loginUrl = new URL("/login", request.url)
    const response = NextResponse.redirect(loginUrl)
    if (token) {
      response.cookies.delete(AUTH_COOKIE_NAME)
    }
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
