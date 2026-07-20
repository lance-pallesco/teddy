"use server"

import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { z } from "zod"
import { Gender } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import { signAuthToken, getAuthCookieOptions, AUTH_COOKIE_NAME } from "@/lib/auth/jwt"

const completeProfileSchema = z.object({
  role: z.enum(["ADOPTER", "PET_OWNER"]),
  phone: z
    .string()
    .trim()
    .regex(/^\d{10,15}$/, "Phone must be 10 to 15 digits"),
  address: z.string().trim().min(1, "Address is required"),
  gender: z.nativeEnum(Gender),
})

export type CompleteProfileInput = z.infer<typeof completeProfileSchema>

type CompleteProfileResponse = {
  success: boolean
  message: string
}

export async function completeGoogleRegistration(
  inputs: unknown
): Promise<CompleteProfileResponse> {
  // 1. Retrieve and verify the temporary oauth state token
  const cookieStore = await cookies()
  const tempToken = cookieStore.get("oauth_signup_state")?.value

  if (!tempToken) {
    return {
      success: false,
      message: "Your Google registration session has expired. Please sign in with Google again.",
    }
  }

  // 2. Validate form inputs
  const parsed = completeProfileSchema.safeParse(inputs)
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid profile details.",
    }
  }

  try {
    const secret = process.env.JWT_SECRET ?? process.env.AUTH_SECRET
    if (!secret) {
      throw new Error("JWT_SECRET or AUTH_SECRET must be configured")
    }

    const { payload } = await jwtVerify(
      tempToken,
      new TextEncoder().encode(secret),
      { algorithms: ["HS256"] }
    )

    const googleData = payload as {
      email: string
      firstName: string
      lastName: string
      avatar: string
    }

    // 3. Verify phone uniqueness in DB
    const duplicatePhone = await prisma.user.findUnique({
      where: { phone: parsed.data.phone },
      select: { id: true },
    })

    if (duplicatePhone) {
      return {
        success: false,
        message: "This phone number is already registered to another account.",
      }
    }

    // Verify email uniqueness (edge case where someone registers in parallel)
    const duplicateEmail = await prisma.user.findUnique({
      where: { email: googleData.email },
      select: { id: true },
    })

    if (duplicateEmail) {
      return {
        success: false,
        message: "An account with this email address already exists.",
      }
    }

    // 4. Generate a random secure password hash
    const rawPassword = crypto.randomBytes(32).toString("hex")
    const passwordHash = await bcrypt.hash(rawPassword, 12)

    // 5. Create user record
    const user = await prisma.user.create({
      data: {
        email: googleData.email,
        firstName: googleData.firstName,
        lastName: googleData.lastName,
        avatar: googleData.avatar,
        phone: parsed.data.phone,
        address: parsed.data.address,
        gender: parsed.data.gender,
        role: parsed.data.role,
        password: passwordHash,
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        role: true,
        shelterId: true,
      },
    })

    // 6. Establish session cookie
    const token = await signAuthToken({
      userId: user.id,
      role: user.role,
      firstName: user.firstName,
      shelterId: user.shelterId,
    })

    // 7. Clear temporary onboarding token and set session token
    cookieStore.delete("oauth_signup_state")
    cookieStore.set(AUTH_COOKIE_NAME, token, getAuthCookieOptions())

    return {
      success: true,
      message: "Profile configured successfully.",
    }
  } catch (error) {
    console.error("Error completing Google profile registration:", error)
    return {
      success: false,
      message: "An unexpected database error occurred. Please try again later.",
    }
  }
}
