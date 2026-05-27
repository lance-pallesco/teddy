"use server"

import { revalidatePath } from "next/cache"

import { requireRole } from "@/lib/auth/require-role"
import {
  ShelterNotFoundError,
  toggleShelterStatus,
} from "@/lib/services/shelter.service"
import { toggleShelterStatusSchema } from "@/lib/validations/shelter-status"

type ToggleShelterStatusResponse = {
  success: boolean
  message: string
  data?: {
    shelterId: string
    isActive: boolean
  }
}

export async function toggleShelterStatusAction(
  input: unknown
): Promise<ToggleShelterStatusResponse> {
  await requireRole(["ADMIN"])

  const parsed = toggleShelterStatusSchema.safeParse(input)

  if (!parsed.success) {
    return {
      success: false,
      message: "Invalid shelter. Please refresh and try again.",
    }
  }

  try {
    const updated = await toggleShelterStatus(parsed.data.shelterId)

    revalidatePath("/shelters")
    revalidatePath(`/shelters/${updated.id}`)

    // TODO(MVP): when public pages exist, revalidate related browse/detail pages
    // (ex: `/pets`, `/shelters/${slug}`, etc) from a centralized invalidation helper.

    return {
      success: true,
      message: updated.isActive
        ? "Shelter activated successfully."
        : "Shelter deactivated successfully.",
      data: {
        shelterId: updated.id,
        isActive: updated.isActive,
      },
    }
  } catch (error) {
    if (error instanceof ShelterNotFoundError) {
      return {
        success: false,
        message: "Shelter not found.",
      }
    }

    return {
      success: false,
      message: "Unable to update shelter status. Please try again later.",
    }
  }
}

