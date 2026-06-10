"use server"

import { revalidatePath } from "next/cache"

import { requireRole } from "@/lib/auth/require-role"
import {
  createPetForUser,
  PetOwnershipError,
  type CreatedPetSummary,
} from "@/lib/services/pet.service"
import { ShelterInactiveError, ShelterNotFoundError } from "@/lib/services/shelter.service"
import { createPetSchema } from "@/lib/validations/pet"

type CreatePetResponse = {
  success: boolean
  message: string
  data?: CreatedPetSummary
}

export async function createPetAction(input: unknown): Promise<CreatePetResponse> {
  const user = await requireRole(["SHELTER_STAFF", "PET_OWNER"])

  const parsed = createPetSchema.safeParse(input)

  if (!parsed.success) {
    return {
      success: false,
      message: "Please review the pet details and try again.",
    }
  }

  try {
    const pet = await createPetForUser(parsed.data, {
      userId: user.id,
      role: user.role,
      shelterId: user.shelterId,
    })

    revalidatePath("/pets")
    revalidatePath("/pets/new")

    return {
      success: true,
      message: "Pet created successfully.",
      data: pet,
    }
  } catch (error) {
    console.error("Error creating pet:", error)
    if (error instanceof ShelterNotFoundError) {
      return { success: false, message: "Shelter not found." }
    }

    if (error instanceof ShelterInactiveError) {
      return {
        success: false,
        message: "Your shelter is inactive. Contact an administrator.",
      }
    }

    if (error instanceof PetOwnershipError) {
      return { success: false, message: error.message }
    }

    return {
      success: false,
      message: "Unable to save the pet. Please try again later.",
    }
  }
}
