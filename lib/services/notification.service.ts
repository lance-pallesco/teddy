import "server-only"
import { prisma } from "@/lib/prisma"
import { NotificationType } from "@prisma/client"

export class NotificationService {
  /**
   * Creates a notification for a target user and sends a duplicate copy to all active ADMIN users.
   */
  async createNotification(
    userId: string,
    title: string,
    description: string,
    type: NotificationType,
    link?: string
  ) {
    // 1. Create the primary notification
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        description,
        type,
        link,
      },
    })

    // 2. Query target user's role to check if we should notify Admins
    const recipient = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })

    // Avoid duplicating to admins if the target user is already an admin
    if (recipient && recipient.role !== "ADMIN") {
      const admins = await prisma.user.findMany({
        where: { role: "ADMIN", isActive: true },
        select: { id: true },
      })

      // Send admin copies of the movement
      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            title: `[ADMIN] ${title}`,
            description: `${description} (Recipient: ${userId})`,
            type,
            link,
          },
        })
      }
    }

    return notification
  }

  /**
   * Helper to create notifications for multiple users simultaneously (e.g. all staff members).
   */
  async notifyMultipleUsers(
    userIds: string[],
    title: string,
    description: string,
    type: NotificationType,
    link?: string
  ) {
    const uniqueUserIds = Array.from(new Set(userIds))
    const creations = uniqueUserIds.map((userId) =>
      this.createNotification(userId, title, description, type, link)
    )
    return Promise.all(creations)
  }

  async getNotificationsForUser(userId: string, limit = 50) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    })
  }

  async markNotificationAsRead(id: string, userId: string) {
    return prisma.notification.update({
      where: { id, userId },
      data: { isUnread: false },
    })
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isUnread: true },
      data: { isUnread: false },
    })
  }

  async deleteNotification(id: string, userId: string) {
    return prisma.notification.delete({
      where: { id, userId },
    })
  }

  async clearAllNotifications(userId: string) {
    return prisma.notification.deleteMany({
      where: { userId },
    })
  }
}

export const notificationService = new NotificationService()
