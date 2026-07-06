"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/lib/auth/session"
import { notificationService } from "@/lib/services/notification.service"

import { prisma } from "@/lib/prisma"

export type NotificationActionResponse<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function getNotificationsAction(): Promise<NotificationActionResponse> {
  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, error: "Authentication required" }
    
    const notifications = await notificationService.getNotificationsForUser(user.id)
    return { success: true, data: notifications }
  } catch (error: unknown) {
    console.error("Error fetching notifications:", error)
    return { success: false, error: "Failed to load notifications." }
  }
}

export async function markNotificationAsReadAction(id: string): Promise<NotificationActionResponse> {
  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, error: "Authentication required" }
    
    await notificationService.markNotificationAsRead(id, user.id)
    revalidatePath("/notifications")
    return { success: true, data: null }
  } catch (error: unknown) {
    console.error("Error marking notification as read:", error)
    return { success: false, error: "Failed to update notification." }
  }
}

export async function markAllNotificationsAsReadAction(): Promise<NotificationActionResponse> {
  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, error: "Authentication required" }
    
    await notificationService.markAllAsRead(user.id)
    revalidatePath("/notifications")
    return { success: true, data: null }
  } catch (error: unknown) {
    console.error("Error marking all notifications as read:", error)
    return { success: false, error: "Failed to update notifications." }
  }
}

export async function deleteNotificationAction(id: string): Promise<NotificationActionResponse> {
  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, error: "Authentication required" }
    
    await notificationService.deleteNotification(id, user.id)
    revalidatePath("/notifications")
    return { success: true, data: null }
  } catch (error: unknown) {
    console.error("Error deleting notification:", error)
    return { success: false, error: "Failed to delete notification." }
  }
}

export async function clearAllNotificationsAction(): Promise<NotificationActionResponse> {
  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, error: "Authentication required" }
    
    await notificationService.clearAllNotifications(user.id)
    revalidatePath("/notifications")
    return { success: true, data: null }
  } catch (error: unknown) {
    console.error("Error clearing all notifications:", error)
    return { success: false, error: "Failed to clear notifications." }
  }
}

export async function triggerMockStatusUpdateAction(
  applicationId: string,
  status: "APPROVED" | "REJECTED"
): Promise<NotificationActionResponse> {
  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, error: "Authentication required" }

    const app = await prisma.adoptionApplication.findUnique({
      where: { id: applicationId },
      include: { pet: true },
    })

    if (!app) return { success: false, error: "Application not found" }

    // Update in DB
    await prisma.adoptionApplication.update({
      where: { id: applicationId },
      data: { status, reviewedAt: new Date() },
    })

    // Trigger Notification to Adopter + Admins
    const message = status === "APPROVED"
      ? `Congratulations! Your adoption application for ${app.pet.name} has been approved.`
      : `We regret to inform you that your adoption application for ${app.pet.name} was rejected.`

    await notificationService.createNotification(
      app.applicantId,
      "Application Status Update",
      message,
      "APPLICATION",
      `/applications/${applicationId}`
    )

    revalidatePath(`/applications/${applicationId}`)
    return { success: true, data: null }
  } catch (error: unknown) {
    console.error("Error triggering mock status update:", error)
    return { success: false, error: "Failed to update status." }
  }
}

export async function triggerMockMeetAndGreetAction(
  applicationId: string,
  dateTime: string
): Promise<NotificationActionResponse> {
  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, error: "Authentication required" }

    const app = await prisma.adoptionApplication.findUnique({
      where: { id: applicationId },
      include: { pet: true },
    })

    if (!app) return { success: false, error: "Application not found" }

    // Trigger notification to Adopter + Reviewer + Admins
    const formattedDate = new Date(dateTime).toLocaleString()
    const description = `A Meet & Greet session has been scheduled for ${app.pet.name} on ${formattedDate}.`

    // Notify Adopter
    await notificationService.createNotification(
      app.applicantId,
      "Meet & Greet Scheduled",
      description,
      "MEET_AND_GREET",
      `/applications/${applicationId}`
    )

    // Notify Reviewer
    const reviewerId = app.pet.postedById || (await prisma.user.findFirst({
      where: { shelterId: app.pet.shelterId, role: "SHELTER_STAFF" },
      select: { id: true },
    }))?.id

    if (reviewerId && reviewerId !== app.applicantId) {
      await notificationService.createNotification(
        reviewerId,
        "Meet & Greet Scheduled",
        description,
        "MEET_AND_GREET",
        `/applications/${applicationId}`
      )
    }

    revalidatePath(`/applications/${applicationId}`)
    return { success: true, data: null }
  } catch (error: unknown) {
    console.error("Error triggering mock meet & greet:", error)
    return { success: false, error: "Failed to schedule meet & greet." }
  }
}

export async function getMockApplicationsAction(): Promise<NotificationActionResponse> {
  try {
    const apps = await prisma.adoptionApplication.findMany({
      include: {
        pet: { select: { name: true } },
        applicant: { select: { firstName: true, lastName: true } },
      },
      take: 10,
    })
    return { success: true, data: apps }
  } catch (error: unknown) {
    console.error("Error fetching mock applications:", error)
    return { success: false, error: "Failed to load applications." }
  }
}
