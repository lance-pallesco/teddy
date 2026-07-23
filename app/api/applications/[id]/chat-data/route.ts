import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/session"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const { id: applicationId } = await params

    const application = await prisma.adoptionApplication.findUnique({
      where: { id: applicationId, deletedAt: null },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            shelterId: true,
            postedById: true,
          },
        },
      },
    })

    if (!application) {
      return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 })
    }

    // Authorization checks
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
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 403 })
    }

    // Fetch messages with sender avatar
    const rawMessages = await prisma.chatMessage.findMany({
      where: { applicationId },
      include: {
        sender: {
          select: {
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    })

    const messages = rawMessages.map((msg) => ({
      id: msg.id,
      senderId: msg.senderId,
      senderName: msg.senderName,
      senderRole: msg.senderRole,
      content: msg.content,
      isPinned: msg.isPinned,
      createdAt: msg.createdAt,
      senderAvatar: msg.sender?.avatar ?? null,
    }))

    return NextResponse.json({
      success: true,
      data: {
        application,
        messages,
      },
    })
  } catch (error: any) {
    console.error("Error in chat-data API:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
