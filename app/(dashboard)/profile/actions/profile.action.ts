"use server"

import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

import { requireRole } from "@/lib/auth/require-role"
import { prisma } from "@/lib/prisma"
import {
  updateProfileSchema,
  changePasswordSchema,
} from "@/lib/validations/profile"

export type ProfileActionResponse = {
  success: boolean
  message: string
}

export async function updateProfileAction(
  input: unknown
): Promise<ProfileActionResponse> {
  const user = await requireRole(["ADMIN", "SHELTER_STAFF", "PET_OWNER", "ADOPTER"])

  const parsed = updateProfileSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      message: "Please review the profile details and try again.",
    }
  }

  const { firstName, lastName, phone, gender, address, avatar } = parsed.data

  try {
    // Check if the phone is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        phone,
        id: { not: user.id },
      },
    })
    if (existingUser) {
      return {
        success: false,
        message: "This phone number is already registered by another user.",
      }
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName,
        lastName,
        phone,
        gender,
        address,
        avatar: avatar || "",
      },
    })

    revalidatePath("/profile")

    return {
      success: true,
      message: "Profile updated successfully.",
    }
  } catch (error) {
    console.error("Error updating profile:", error)
    return {
      success: false,
      message: "Unable to update profile. Please try again later.",
    }
  }
}

export async function changePasswordAction(
  input: unknown
): Promise<ProfileActionResponse> {
  const user = await requireRole(["ADMIN", "SHELTER_STAFF", "PET_OWNER", "ADOPTER"])

  const parsed = changePasswordSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      message: "Please review the password requirements and try again.",
    }
  }

  const { currentPassword, newPassword } = parsed.data

  try {
    // Fetch the user with their password hash from the DB
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { password: true },
    })

    if (!dbUser) {
      return {
        success: false,
        message: "User not found.",
      }
    }

    const passwordMatches = await bcrypt.compare(currentPassword, dbUser.password)
    if (!passwordMatches) {
      return {
        success: false,
        message: "Current password is incorrect.",
      }
    }

    const passwordHash = await bcrypt.hash(newPassword, 12)

    await prisma.user.update({
      where: { id: user.id },
      data: { password: passwordHash },
    })

    revalidatePath("/profile")

    return {
      success: true,
      message: "Password changed successfully.",
    }
  } catch (error) {
    console.error("Error changing password:", error)
    return {
      success: false,
      message: "Unable to change password. Please try again later.",
    }
  }
}
