"use server"

import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

import { requireRole } from "@/lib/auth/require-role"
import {
  createShelterStaffUser,
  DuplicateUserError,
  type PublicUser,
} from "@/lib/services/user.service"
import {
  ShelterInactiveError,
  ShelterNotFoundError,
} from "@/lib/services/shelter.service"
import { createShelterStaffSchema } from "@/lib/validations/shelter-staff"

type CreateShelterStaffResponse = {
  success: boolean
  message: string
  data?: PublicUser
}

export async function createShelterStaffAction(
  input: unknown
): Promise<CreateShelterStaffResponse> {
  await requireRole(["ADMIN"])

  const parsed = createShelterStaffSchema.safeParse(input)

  if (!parsed.success) {
    return {
      success: false,
      message: "Please check the staff details and try again.",
    }
  }

  try {
    const passwordHash = await bcrypt.hash(parsed.data.password, 12)
    const user = await createShelterStaffUser({
      ...parsed.data,
      passwordHash,
    })

    revalidatePath("/shelters")
    revalidatePath(`/shelters/${parsed.data.shelterId}`)
    revalidatePath(`/shelters/${parsed.data.shelterId}/new`)
    revalidatePath("/shelters/staff/new")

    return {
      success: true,
      message: "Shelter staff account created successfully.",
      data: user,
    }
  } catch (error) {
    if (error instanceof ShelterNotFoundError) {
      return { success: false, message: "Shelter not found." }
    }

    if (error instanceof ShelterInactiveError) {
      return {
        success: false,
        message: "This shelter is inactive. Activate it before adding staff.",
      }
    }

    if (error instanceof DuplicateUserError) {
      return {
        success: false,
        message: "A user with this email or phone already exists.",
      }
    }

    return {
      success: false,
      message: "Unable to create staff account. Please try again later.",
    }
  }
}

