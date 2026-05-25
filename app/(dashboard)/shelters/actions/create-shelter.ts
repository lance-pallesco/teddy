"use server"

import { revalidatePath } from "next/cache"

import { requireRole } from "@/lib/auth/require-role"
import {
  createShelter,
  DuplicateShelterError,
  type ShelterListItem,
} from "@/lib/services/shelter.service"
import { createShelterSchema } from "@/lib/validations/shelter"

type CreateShelterResponse = {
  success: boolean
  message: string
  data?: ShelterListItem
}

export async function createShelterAction(
  input: unknown
): Promise<CreateShelterResponse> {
  await requireRole(["ADMIN"])

  const parsed = createShelterSchema.safeParse(input)

  if (!parsed.success) {
    return {
      success: false,
      message: "Please check the shelter details and try again.",
    }
  }

  try {
    const shelter = await createShelter(parsed.data)
    revalidatePath("/shelters")

    return {
      success: true,
      message: "Shelter created successfully",
      data: shelter,
    }
  } catch (error) {
    if (error instanceof DuplicateShelterError) {
      return {
        success: false,
        message: "Unable to create a shelter with the provided information.",
      }
    }

    return {
      success: false,
      message: "Unable to create shelter. Please try again later.",
    }
  }
}
