import "server-only"

import { cookies } from "next/headers"

import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth/jwt"
import { prisma } from "@/lib/prisma"

export async function getCurrentUser() {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value

  if (!token) {
    return null
  }

  try {
    const payload = await verifyAuthToken(token)

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        role: true,
        shelterId: true,
        isActive: true,
      },
    })

    if (!user?.isActive) {
      return null
    }

    return user
  } catch {
    return null
  }
}
