import { NextResponse, type NextRequest } from "next/server"

import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth/jwt"
import {
  canAccessDashboardPath,
  isDashboardRole,
} from "@/lib/navigation/dashboard-nav"

const LOGIN_PATH = "/login"
const UNAUTHORIZED_PATH = "/unauthorized"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value

  if (!token) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url))
  }

  try {
    const payload = await verifyAuthToken(token)

    if (!isDashboardRole(payload.role)) {
      return NextResponse.redirect(new URL(LOGIN_PATH, request.url))
    }

    if (!canAccessDashboardPath(payload.role, pathname)) {
      return NextResponse.redirect(new URL(UNAUTHORIZED_PATH, request.url))
    }

    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url))
  }
}

export const config = {
  matcher: [
    "/dashboard",
    "/profile",
    "/unauthorized",
    "/shelters/:path*",
    "/shelter/:path*",
    "/users/:path*",
    "/pets/:path*",
    "/applications/:path*",
    "/analytics",
    "/medical/:path*",
  ],
}
