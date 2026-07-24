import { redirect, notFound } from "next/navigation"
import { getCurrentUser } from "@/lib/auth/session"
import { prisma } from "@/lib/prisma"
import { ApplicationChatRoom } from "@/components/applications/application-chat-room"
import { SetBreadcrumbLabel } from "@/components/dashboard/breadcrumb-context"

interface ChatPageProps {
  params: Promise<{ id: string }>
}

export default async function ChatPage({ params }: ChatPageProps) {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }

  const { id } = await params

  // Fetch application detail with all necessary relationships
  const application = await prisma.adoptionApplication.findUnique({
    where: { id, deletedAt: null },
    include: {
      applicant: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
      pet: {
        include: {
          petImages: {
            orderBy: { isPrimary: "desc" },
          },
          shelter: {
            select: {
              id: true,
              name: true,
              city: true,
              province: true,
              logo: true,
            },
          },
          postedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      },
      chatMessages: {
        include: {
          sender: {
            select: {
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  })

  if (!application) {
    notFound()
  }

  // --- Authorization checks ---
  const role = user.role
  let hasAccess = false

  if (role === "ADMIN") {
    hasAccess = true
  } else if (role === "ADOPTER" && application.applicantId === user.id) {
    hasAccess = true
  } else if (role === "SHELTER_STAFF" && application.pet.shelterId === user.shelterId) {
    hasAccess = true
  } else if (role === "PET_OWNER" && application.pet.postedById === user.id) {
    hasAccess = true
  }

  if (!hasAccess) {
    redirect("/unauthorized")
  }

  // Verify application has chat unlocked (must have progressed to interview)
  const allowedStatuses = ["INTERVIEW_IN_PROGRESS", "APPROVED", "REJECTED"]
  if (!allowedStatuses.includes(application.status)) {
    redirect(`/applications/${application.id}`)
  }

  const isReviewer = ["SHELTER_STAFF", "PET_OWNER", "ADMIN"].includes(role)

  // Map database chatMessages to client interface
  const initialMessages = application.chatMessages.map((msg) => ({
    id: msg.id,
    senderId: msg.senderId,
    senderName: msg.senderName,
    senderRole: msg.senderRole,
    content: msg.content,
    isPinned: msg.isPinned,
    createdAt: msg.createdAt,
    senderAvatar: msg.sender?.avatar ?? null,
  }))

  const currentUserData = {
    id: user.id,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    avatar: user.avatar,
  }

  return (
    <>
      <SetBreadcrumbLabel segment="chat" label="Chat Room" />
      <ApplicationChatRoom
        applicationId={application.id}
        initialMessages={initialMessages}
        initialApplication={application}
        currentUser={currentUserData}
        isReviewer={isReviewer}
      />
    </>
  )
}
