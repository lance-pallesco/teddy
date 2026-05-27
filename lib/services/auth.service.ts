import bcrypt from "bcryptjs"

import { prisma } from "@/lib/prisma"
import type { LoginInput } from "@/lib/validations/auth"

const MAX_FAILED_LOGIN_ATTEMPTS = 5
const LOCK_DURATION_MS = 15 * 60 * 1000

export type AuthenticatedUser = {
  id: string
  firstName: string
  role: "ADMIN" | "SHELTER_STAFF" | "RESCUER" | "ADOPTER"
  shelterId: string | null
}

export type AuthenticationResult =
  | { status: "authenticated"; user: AuthenticatedUser }
  | { status: "invalid" }
  | { status: "locked" }
  | { status: "inactive" }

async function recordFailedLogin(user: {
  id: string
  failedLoginAttempts: number
}) {
  const failedLoginAttempts = user.failedLoginAttempts + 1
  const shouldLock = failedLoginAttempts >= MAX_FAILED_LOGIN_ATTEMPTS

  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: shouldLock ? 0 : failedLoginAttempts,
      lockedUntil: shouldLock ? new Date(Date.now() + LOCK_DURATION_MS) : null,
    },
  })
}

export async function authenticateUser(
  input: LoginInput
): Promise<AuthenticationResult> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: {
      id: true,
      firstName: true,
      role: true,
      shelterId: true,
      password: true,
      isActive: true,
      failedLoginAttempts: true,
      lockedUntil: true,
    },
  })

  if (!user) {
    return { status: "invalid" }
  }

  const now = new Date()

  if (user.lockedUntil && now < user.lockedUntil) {
    return { status: "locked" }
  }

  if (user.lockedUntil && now >= user.lockedUntil) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    })
  }

  if (!user.isActive) {
    return { status: "inactive" }
  }

  // TODO(MVP): when shelter operations are enabled for SHELTER_STAFF, also block
  // authentication if their assigned shelter is inactive.

  const passwordMatches = await bcrypt.compare(input.password, user.password)

  if (!passwordMatches) {
    await recordFailedLogin(user)
    return { status: "invalid" }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  })

  return {
    status: "authenticated",
    user: {
      id: user.id,
      firstName: user.firstName,
      role: user.role,
      shelterId: user.shelterId,
    },
  }
}
