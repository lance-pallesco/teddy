"use server"

import { revalidatePath } from "next/cache"
import { requireRole } from "@/lib/auth/require-role"
import { toggleUserStatus } from "@/lib/services/user.service"

export async function toggleUserStatusAction(userId: string) {
  try {
    await requireRole(["ADMIN"])
    const updated = await toggleUserStatus(userId)
    revalidatePath("/users")
    return {
      success: true,
      message: `User is now ${updated.isActive ? "active" : "inactive"}.`,
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to toggle user status.",
    }
  }
}
