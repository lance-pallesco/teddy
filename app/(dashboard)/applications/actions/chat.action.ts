"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/lib/auth/session"
import { requireRole } from "@/lib/auth/require-role"
import { prisma } from "@/lib/prisma"
import { aiClient } from "@/lib/ai/client"
import { chatService } from "@/lib/services/chat.service"
import { notificationService } from "@/lib/services/notification.service"
import type { ChatMode } from "@prisma/client"

export type ChatActionResponse<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string }

// helper to assert reviewer access
async function verifyReviewerAccess(applicationId: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error("Authentication required")
  if (!["SHELTER_STAFF", "PET_OWNER", "ADMIN"].includes(user.role)) {
    throw new Error("Unauthorized review access")
  }

  const app = await prisma.adoptionApplication.findUnique({
    where: { id: applicationId },
    include: { pet: true },
  })

  if (!app) throw new Error("Application not found")

  // Authorization checks
  if (user.role === "SHELTER_STAFF" && app.pet.shelterId !== user.shelterId) {
    throw new Error("Unauthorized access to this shelter's applications")
  }
  if (user.role === "PET_OWNER" && app.pet.postedById !== user.id) {
    throw new Error("Unauthorized access to this pet owner's applications")
  }

  return { user, app }
}

// 1. Proceed to Chat: starts the interview/discussion
export async function startChatModeAction(
  applicationId: string,
  mode: "MANUAL" | "AI_ASSISTED"
): Promise<ChatActionResponse> {
  try {
    const { user, app } = await verifyReviewerAccess(applicationId)

    if (app.status !== "PENDING" && app.status !== "UNDER_REVIEW") {
      return { success: false, error: "Application is not in a reviewable state." }
    }

    // Initialize chat variables
    let generatedQuestions: any[] = []
    let firstQuestionText = ""

    if (mode === "AI_ASSISTED") {
      // Generate AI questions based on application flags
      generatedQuestions = await chatService.generateInterviewQuestions(applicationId)
      
      // Initialize flags with status "PENDING"
      generatedQuestions = generatedQuestions.map((q) => ({
        ...q,
        status: q.flag ? "PENDING" : undefined,
        resolutionNotes: "",
      }))

      if (generatedQuestions.length > 0) {
        firstQuestionText = generatedQuestions[0].question
      }
    }

    // Update Application details in DB
    await prisma.adoptionApplication.update({
      where: { id: applicationId },
      data: {
        status: "INTERVIEW_IN_PROGRESS",
        chatMode: mode,
        chatStatus: "ACTIVE",
        chatQuestions: generatedQuestions || undefined,
        chatQuestionIndex: 0,
      },
    })

    // Post Welcome Messages
    if (mode === "AI_ASSISTED") {
      // System message
      await prisma.chatMessage.create({
        data: {
          applicationId,
          senderName: "System",
          senderRole: "SYSTEM",
          content: `👋 Your application for ${app.pet.name} has progressed to the interview stage. TeddyAI will guide this conversation on behalf of the reviewer.\n\nYou can answer in any language you are comfortable with — English, Filipino, Cebuano, or any other. TeddyAI will understand.\n\nThe reviewer is observing this conversation and will make the final decision.\n\nTake your time with each answer.`,
        },
      })

      // Bot first question
      if (firstQuestionText) {
        await prisma.chatMessage.create({
          data: {
            applicationId,
            senderName: "TeddyAI",
            senderRole: "AI",
            content: `Hi ${app.applicantId ? (await prisma.user.findUnique({ where: { id: app.applicantId } }))?.firstName : "there"}! Thank you for applying to adopt ${app.pet.name}. I'm TeddyAI, and I'll be guiding this conversation today.\n\nLet's start with our first question:\n\n${firstQuestionText}`,
          },
        })
      }
    } else {
      // Manual mode welcome
      const shelterName = app.pet.shelterId
        ? (await prisma.shelter.findUnique({ where: { id: app.pet.shelterId } }))?.name
        : `${user.firstName} ${user.lastName}`

      await prisma.chatMessage.create({
        data: {
          applicationId,
          senderName: "System",
          senderRole: "SYSTEM",
          content: `Your application for ${app.pet.name} has progressed to the discussion stage. You are now connected with ${shelterName || "the reviewer"}.\n\nFeel free to message in any language.`,
        },
      })
    }

    // Notify adopter that chat is unlocked
    await notificationService.createNotification(
      app.applicantId,
      "Chat Unlocked",
      `Your application for ${app.pet.name} has progressed! Click here to enter the discussion with the reviewer.`,
      "APPLICATION",
      `/applications/${applicationId}/chat`
    )

    revalidatePath(`/applications/${applicationId}`)
    revalidatePath(`/applications/${applicationId}/chat`)
    return { success: true, data: null }
  } catch (error: any) {
    console.error("Error starting chat mode:", error)
    return { success: false, error: error.message || "Failed to start chat." }
  }
}

// 2. Sends message in Chat and processes AI interview logic if AI-assisted
export async function sendChatMessageAction(
  applicationId: string,
  content: string
): Promise<ChatActionResponse> {
  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, error: "Authentication required" }

    const app = await prisma.adoptionApplication.findUnique({
      where: { id: applicationId },
      include: { pet: true },
    })

    if (!app) return { success: false, error: "Application not found" }
    if (app.chatStatus !== "ACTIVE" || app.status !== "INTERVIEW_IN_PROGRESS") {
      return { success: false, error: "This chat is locked or completed." }
    }

    const isAdopter = user.role === "ADOPTER"
    const senderRole = isAdopter ? "ADOPTER" : "REVIEWER"
    const senderName = `${user.firstName} ${user.lastName}`

    // 1. Create the user message in DB
    const message = await prisma.chatMessage.create({
      data: {
        applicationId,
        senderId: user.id,
        senderName,
        senderRole,
        content,
      },
    })

    // 2. Trigger AI logic if AI-assisted and message is from Adopter
    if (app.chatMode === "AI_ASSISTED" && isAdopter) {
      const chatQuestions = (app.chatQuestions as any[]) || []
      const currentIndex = app.chatQuestionIndex
      const currentQuestion = chatQuestions[currentIndex]

      if (currentQuestion) {
        // Fetch last 15 messages for history context
        const rawHistory = await prisma.chatMessage.findMany({
          where: { applicationId },
          orderBy: { createdAt: "asc" },
          take: 15,
        })
        const history = rawHistory.map((m) => ({
          senderRole: m.senderRole,
          content: m.content,
        }))

        // Call AI response processor
        const aiResult = await chatService.processAdopterResponse(
          applicationId,
          currentQuestion.question,
          currentQuestion.flag,
          content,
          history
        )

        // Update Flag statuses in DB if needed
        const updatedQuestions = [...chatQuestions]
        if (aiResult.updatedFlags && aiResult.updatedFlags.length > 0) {
          aiResult.updatedFlags.forEach((update: any) => {
            const matchIdx = updatedQuestions.findIndex((q) => q.flag === update.title)
            if (matchIdx !== -1) {
              updatedQuestions[matchIdx] = {
                ...updatedQuestions[matchIdx],
                status: update.status,
                resolutionNotes: update.resolutionNotes,
              };
            }
          })
        }

        if (aiResult.shouldAdvance) {
          const nextIndex = currentIndex + 1

          // Check if there are more questions
          if (nextIndex < chatQuestions.length) {
            const nextQuestion = chatQuestions[nextIndex]

            // Save state and index
            await prisma.adoptionApplication.update({
              where: { id: applicationId },
              data: {
                chatQuestionIndex: nextIndex,
                chatQuestions: updatedQuestions,
              },
            })

            // Post TeddyAI transition + next question
            const botResponseContent = `${aiResult.responseContent}\n\n${nextQuestion.question}`
            await prisma.chatMessage.create({
              data: {
                applicationId,
                senderName: "TeddyAI",
                senderRole: "AI",
                content: botResponseContent,
              },
            })
          } else {
            // Interview complete! Update chatStatus to AWAITING (locks out typing)
            await prisma.adoptionApplication.update({
              where: { id: applicationId },
              data: {
                chatStatus: "AWAITING",
                chatQuestions: updatedQuestions,
              },
            })

            // Post completion bot message
            await prisma.chatMessage.create({
              data: {
                applicationId,
                senderName: "System",
                senderRole: "SYSTEM",
                content: `Thank you so much for your thoughtful answers, ${user.firstName}. We've covered everything we needed to discuss.\n\nThe reviewer will now review our conversation and will be in touch with their decision shortly. You'll receive a notification as soon as they decide.\n\nWishing you and ${app.pet.name} all the best! 🐾`,
              },
            })

            // Generate final Post-Interview AI Summary in background (save to JSON column)
            const fullHistory = await prisma.chatMessage.findMany({
              where: { applicationId },
              orderBy: { createdAt: "asc" },
            })
            const historyFormatted = fullHistory.map((h) => ({
              senderRole: h.senderRole,
              content: h.content,
            }))

            const summary = await chatService.generatePostInterviewSummary(
              applicationId,
              historyFormatted
            )

            await prisma.adoptionApplication.update({
              where: { id: applicationId },
              data: {
                aiPostInterviewSummary: summary,
              },
            })
          }
        } else {
          // Clarification request, gibberish, or evasive answer -> DO NOT ADVANCE INDEX!
          await prisma.adoptionApplication.update({
            where: { id: applicationId },
            data: {
              chatQuestions: updatedQuestions,
            },
          })

          // Post TeddyAI clarification/nudge response for the SAME current question
          await prisma.chatMessage.create({
            data: {
              applicationId,
              senderName: "TeddyAI",
              senderRole: "AI",
              content: aiResult.responseContent,
            },
          })
        }
      }
    }

    revalidatePath(`/applications/${applicationId}/chat`)
    return { success: true, data: message }
  } catch (error: any) {
    console.error("Error sending chat message:", error)
    return { success: false, error: error.message || "Failed to send message." }
  }
}

// 3. Interject Question: Reviewer adds a custom question to the AI queue
export async function interjectQuestionAction(
  applicationId: string,
  content: string
): Promise<ChatActionResponse> {
  try {
    const { app } = await verifyReviewerAccess(applicationId)

    if (app.chatStatus !== "ACTIVE" || app.chatMode !== "AI_ASSISTED") {
      return { success: false, error: "Cannot interject. Chat is not in an active AI-assisted state." }
    }

    const currentQuestions = (app.chatQuestions as any[]) || []
    const index = app.chatQuestionIndex

    const newQuestion = {
      question: content,
      reason: "Interjected by human reviewer",
      flag: null,
      isMandatory: true,
      isInterjected: true,
    }

    // Insert the interjected question right after the current active question index
    const updatedQuestions = [...currentQuestions]
    updatedQuestions.splice(index + 1, 0, newQuestion)

    // Save back to DB (increment index remains the same but questions array has changed)
    await prisma.adoptionApplication.update({
      where: { id: applicationId },
      data: {
        chatQuestions: updatedQuestions,
      },
    })

    revalidatePath(`/applications/${applicationId}/chat`)
    return { success: true, data: null }
  } catch (error: any) {
    console.error("Error interjecting question:", error)
    return { success: false, error: error.message || "Failed to interject question." }
  }
}

// 4. End Interview Early
export async function endInterviewEarlyAction(applicationId: string): Promise<ChatActionResponse> {
  try {
    const { app } = await verifyReviewerAccess(applicationId)

    if (app.chatStatus !== "ACTIVE") {
      return { success: false, error: "Interview is not active." }
    }

    // Update status to awaiting
    await prisma.adoptionApplication.update({
      where: { id: applicationId },
      data: {
        chatStatus: "AWAITING",
      },
    })

    // Post end system message
    await prisma.chatMessage.create({
      data: {
        applicationId,
        senderName: "System",
        senderRole: "SYSTEM",
        content: `The reviewer has ended this interview discussion. The chat is now locked. Awaiting decision.`,
      },
    })

    // Compile Post-Interview AI Summary
    const fullHistory = await prisma.chatMessage.findMany({
      where: { applicationId },
      orderBy: { createdAt: "asc" },
    })
    const historyFormatted = fullHistory.map((h) => ({
      senderRole: h.senderRole,
      content: h.content,
    }))

    const summary = await chatService.generatePostInterviewSummary(
      applicationId,
      historyFormatted
    )

    await prisma.adoptionApplication.update({
      where: { id: applicationId },
      data: {
        aiPostInterviewSummary: summary,
      },
    })

    revalidatePath(`/applications/${applicationId}/chat`)
    return { success: true, data: null }
  } catch (error: any) {
    console.error("Error ending interview early:", error)
    return { success: false, error: error.message || "Failed to end interview early." }
  }
}

// 5. Toggle Pin Message
export async function togglePinMessageAction(messageId: string): Promise<ChatActionResponse> {
  try {
    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId },
    })
    if (!message) return { success: false, error: "Message not found" }

    const { app } = await verifyReviewerAccess(message.applicationId)

    const updated = await prisma.chatMessage.update({
      where: { id: messageId },
      data: {
        isPinned: !message.isPinned,
      },
    })

    revalidatePath(`/applications/${app.id}/chat`)
    return { success: true, data: updated }
  } catch (error: any) {
    console.error("Error toggling message pin:", error)
    return { success: false, error: error.message || "Failed to pin message." }
  }
}

// 6. Final Reviewer Decisions: Approve & Schedule Meet & Greet, or Reject
export async function reviewDecisionAction(
  applicationId: string,
  decision: "APPROVED" | "REJECTED",
  notes?: string
): Promise<ChatActionResponse> {
  try {
    const { user, app } = await verifyReviewerAccess(applicationId)

    const updateData: any = {
      status: decision,
      chatStatus: "COMPLETED",
      reviewedAt: new Date(),
      reviewedById: user.id,
    }

    if (decision === "REJECTED") {
      updateData.rejectionReason = notes || "Application rejected by reviewer."
    } else {
      updateData.reviewNotes = notes || "Application approved. Ready for Meet & Greet!"
    }

    await prisma.adoptionApplication.update({
      where: { id: applicationId },
      data: updateData,
    })

    // If APPROVED, update pet status to RESERVED to hold it for meet and greet
    if (decision === "APPROVED") {
      await prisma.pet.update({
        where: { id: app.petId },
        data: { status: "RESERVED" },
      })
    }

    // Trigger Notification to Adopter
    const title = decision === "APPROVED" ? "Meet & Greet Scheduled" : "Application Status Update"
    const desc = decision === "APPROVED"
      ? `Congratulations! Your application for ${app.pet.name} was approved. A Meet & Greet is being scheduled!`
      : `We regret to inform you that your application for ${app.pet.name} was not approved.`

    await notificationService.createNotification(
      app.applicantId,
      title,
      desc,
      decision === "APPROVED" ? "MEET_AND_GREET" : "APPLICATION",
      `/applications/${applicationId}`
    )

    revalidatePath(`/applications/${applicationId}`)
    revalidatePath(`/applications/${applicationId}/chat`)
    return { success: true, data: null }
  } catch (error: any) {
    console.error("Error submitting decision:", error)
    return { success: false, error: error.message || "Failed to submit decision." }
  }
}

// 8. Suggest a custom question from AI based on manual chat history
export async function suggestQuestionAction(applicationId: string): Promise<ChatActionResponse> {
  try {
    const { app } = await verifyReviewerAccess(applicationId)

    const rawHistory = await prisma.chatMessage.findMany({
      where: { applicationId },
      orderBy: { createdAt: "asc" },
      take: 20,
    })
    const chatHistory = rawHistory.map((m) => `${m.senderName}: ${m.content}`).join("\n")

    const userPrompt = `
Analyze the following manual discussion history for adopting ${app.pet.name}.
Suggest a helpful, warm, and highly relevant question the reviewer can ask the adopter next to move the conversation forward.
Only return the raw question text. No conversational wrapper, quotes, or markdown.

Discussion History:
${chatHistory}
`
    const model = process.env.AI_MODEL ?? "gpt-4.1-mini"
    const response = await aiClient.createChatCompletion({
      model,
      messages: [
        { role: "system", content: "You are TeddyAI, the pet adoption assistant helper." },
        { role: "user", content: userPrompt },
      ],
    })

    const content = response.choices?.[0]?.message?.content?.trim() || "What are your main expectations during the first adjustment weeks with the pet?"
    const cleanContent = content.replace(/^["'\s]+|["'\s]+$/g, "")
    return { success: true, data: cleanContent }
  } catch (error: any) {
    console.error("Error suggesting question:", error)
    return { success: false, error: error.message || "Failed to suggest question." }
  }
}
