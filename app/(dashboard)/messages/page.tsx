import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth/session"
import { prisma } from "@/lib/prisma"
import { MessagesHubView } from "@/components/messages/messages-hub-view"

export default async function MessagesPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  let whereClause: any = {}

  if (user.role === "ADOPTER") {
    whereClause = {
      applicantId: user.id,
      chatStatus: { in: ["ACTIVE", "COMPLETED", "AWAITING"] },
    }
  } else if (user.role === "SHELTER_STAFF" && user.shelterId) {
    whereClause = {
      pet: { shelterId: user.shelterId },
      chatStatus: { in: ["ACTIVE", "COMPLETED", "AWAITING"] },
    }
  } else if (user.role === "PET_OWNER") {
    whereClause = {
      pet: { postedById: user.id },
      chatStatus: { in: ["ACTIVE", "COMPLETED", "AWAITING"] },
    }
  } else if (user.role === "ADMIN") {
    whereClause = {
      chatStatus: { in: ["ACTIVE", "COMPLETED", "AWAITING"] },
    }
  } else {
    redirect("/unauthorized")
  }

  const applications = await prisma.adoptionApplication.findMany({
    where: whereClause,
    orderBy: { updatedAt: "desc" },
    include: {
      pet: {
        select: {
          id: true,
          name: true,
          species: true,
          breed: true,
          petImages: {
            take: 1,
            select: { url: true },
          },
        },
      },
      applicant: {
        select: {
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
      chatMessages: {
        take: 1,
        orderBy: { createdAt: "desc" },
        select: {
          content: true,
          senderName: true,
          createdAt: true,
        },
      },
    },
  })

  const conversations = applications.map((app) => ({
    id: app.id,
    status: app.status,
    chatStatus: app.chatStatus,
    chatMode: app.chatMode,
    createdAt: app.createdAt,
    pet: app.pet,
    applicant: app.applicant,
    lastMessage: app.chatMessages[0] ?? null,
  }))

  return <MessagesHubView conversations={conversations} userRole={user.role} />
}
