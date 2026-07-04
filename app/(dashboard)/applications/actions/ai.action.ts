"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/lib/auth/session"
import { prisma } from "@/lib/prisma"
import { aiService } from "@/lib/services/ai.service"

export type AIServerActionResponse =
  | { success: true; data: unknown }
  | { success: false; error: string }

async function checkReviewerPermission(applicationId: string) {
  const user = await getCurrentUser()
  if (!user) {
    return { authorized: false, error: "Authentication required" } as const
  }

  const role = user.role
  const isReviewer = ["ADMIN", "SHELTER_STAFF", "PET_OWNER"].includes(role)
  if (!isReviewer) {
    return { authorized: false, error: "Unauthorized access: review permissions required" } as const
  }

  // Fetch application to check ownership
  const application = await prisma.adoptionApplication.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      applicantId: true,
      pet: {
        select: {
          id: true,
          shelterId: true,
          postedById: true,
        },
      },
    },
  })

  if (!application) {
    return { authorized: false, error: "Application not found" } as const
  }

  // Role-specific ownership checks
  if (role === "SHELTER_STAFF") {
    if (application.pet.shelterId !== user.shelterId) {
      return { authorized: false, error: "Unauthorized access to this shelter's applications" } as const
    }
  } else if (role === "PET_OWNER") {
    if (application.pet.postedById !== user.id) {
      return { authorized: false, error: "Unauthorized access to this pet's applications" } as const
    }
  }

  return { authorized: true, user } as const
}

export async function getApplicationAIInsightAction(
  applicationId: string
): Promise<AIServerActionResponse> {
  try {
    const auth = await checkReviewerPermission(applicationId)
    if (!auth.authorized) {
      return { success: false, error: auth.error }
    }

    const insight = await aiService.getAIInsightForApplication(applicationId)
    return { success: true, data: insight }
  } catch (error: unknown) {
    console.error("Error fetching AI insight:", error)
    return { success: false, error: (error as Error).message ?? "An error occurred while loading AI insights." }
  }
}

export async function generateApplicationAIInsightAction(
  applicationId: string
): Promise<AIServerActionResponse> {
  try {
    const auth = await checkReviewerPermission(applicationId)
    if (!auth.authorized) {
      return { success: false, error: auth.error }
    }

    const insight = await aiService.generateAIInsightForApplication(applicationId)

    revalidatePath(`/applications/${applicationId}`)

    return { success: true, data: insight }
  } catch (error: unknown) {
    console.error("Error generating AI insight:", error)
    return { success: false, error: (error as Error).message ?? "Teddy AI is temporarily unavailable." }
  }
}
