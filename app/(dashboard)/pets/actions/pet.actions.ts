"use server"

import { revalidatePath } from "next/cache"

import { requireRole } from "@/lib/auth/require-role"
import {
  updatePetStatus,
  PetNotFoundError,
  PetOwnershipError,
  updatePet,
  type CreatedPetSummary,
} from "@/lib/services/pet.service"
import { PetImageValidationError } from "@/lib/services/pet-image.service"
import { updatePetSchema } from "@/lib/validations/pet"

type PetActionResponse = {
  success: boolean
  message: string
  data?: CreatedPetSummary
}

export async function updatePetAction(input: unknown): Promise<PetActionResponse> {
  const user = await requireRole(["ADMIN", "SHELTER_STAFF", "PET_OWNER"])

  const parsed = updatePetSchema.safeParse(input)

  if (!parsed.success) {
    return {
      success: false,
      message: "Please review the pet details and try again.",
    }
  }

  try {
    const pet = await updatePet(parsed.data, {
      userId: user.id,
      role: user.role,
      shelterId: user.shelterId,
    })

    revalidatePath("/pets")
    revalidatePath(`/pets/${pet.id}`)
    revalidatePath(`/pets/${pet.id}/edit`)

    return {
      success: true,
      message: "Pet status updated successfully.",
      data: pet,
    }
  } catch (error) {
    console.error("Error updating pet:", error)

    if (error instanceof PetNotFoundError) {
      return { success: false, message: error.message }
    }

    if (error instanceof PetOwnershipError) {
      return { success: false, message: error.message }
    }

    if (error instanceof PetImageValidationError) {
      return { success: false, message: error.message }
    }

    return {
      success: false,
      message: "Unable to save changes. Please try again later.",
    }
  }
}

export async function togglePetStatusAction(petId: string, archived: boolean): Promise<PetActionResponse> {
  const user = await requireRole(["ADMIN", "SHELTER_STAFF", "PET_OWNER"])

  if (!petId?.trim()) {
    return { success: false, message: "Invalid pet id." }
  }

  try {
    const pet = await updatePetStatus(petId, archived, {
      userId: user.id,
      role: user.role,
      shelterId: user.shelterId,
    })

    revalidatePath("/pets")
    revalidatePath(`/pets/${pet.id}`)

    return {
      success: true,
      message: `${pet.name} has been successfully ${archived ? "archived" : "restored"}.`,
      data: pet,
    }
  } catch (error) {
    console.error("Error updating pet status:", error)

    if (error instanceof PetNotFoundError) {
      return { success: false, message: error.message }
    }

    if (error instanceof PetOwnershipError) {
      return { success: false, message: error.message }
    }

    return {
      success: false,
      message: "Unable to update this pet's status. Please try again later.",
    }
  }
}
