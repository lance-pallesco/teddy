"use server"

import { revalidatePath } from "next/cache"

import { requireRole } from "@/lib/auth/require-role"
import {
  DuplicateShelterError,
  ShelterNotFoundError,
  updateShelter,
  type ShelterListItem,
} from "@/lib/services/shelter.service"
import { updateShelterSchema } from "@/lib/validations/shelter"

type UpdateShelterResponse = {
  success: boolean
  message: string
  data?: ShelterListItem
}

export async function updateShelterAction(
  input: unknown
): Promise<UpdateShelterResponse> {
  await requireRole(["ADMIN"])

  const parsed = updateShelterSchema.safeParse(input)

  if (!parsed.success) {
    return {
      success: false,
      message: "Please check the shelter details and try again.",
    }
  }

  const { id, ...fields } = parsed.data

  try {
    const shelter = await updateShelter(id, fields)
    revalidatePath("/shelters")
    revalidatePath(`/shelters/${id}/edit`)

    return {
      success: true,
      message: "Shelter updated successfully",
      data: shelter,
    }
  } catch (error) {
    if (error instanceof ShelterNotFoundError) {
      return {
        success: false,
        message: "Shelter not found.",
      }
    }

    if (error instanceof DuplicateShelterError) {
      return {
        success: false,
        message: "Unable to update shelter with the provided information.",
      }
    }

    return {
      success: false,
      message: "Unable to update shelter. Please try again later.",
    }
  }
}
