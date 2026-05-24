import type { Role } from "@prisma/client"
import { jwtVerify, SignJWT } from "jose"

export const AUTH_COOKIE_NAME = "teddy_session"
const SESSION_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 7

export type AuthTokenPayload = {
  userId: string
  role: Role
  firstName: string
  shelterId: string | null
}

function getEncodedSecret() {
  const secret = process.env.JWT_SECRET ?? process.env.AUTH_SECRET

  if (!secret) {
    throw new Error("JWT_SECRET or AUTH_SECRET must be set")
  }

  return new TextEncoder().encode(secret)
}

export function isAuthTokenConfigured() {
  return Boolean(process.env.JWT_SECRET ?? process.env.AUTH_SECRET)
}

export async function signAuthToken(payload: AuthTokenPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_EXPIRES_IN_SECONDS}s`)
    .sign(getEncodedSecret())
}

export async function verifyAuthToken(token: string) {
  const { payload } = await jwtVerify(token, getEncodedSecret(), {
    algorithms: ["HS256"],
  })

  return payload as AuthTokenPayload
}

export function getAuthCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_EXPIRES_IN_SECONDS,
  }
}
