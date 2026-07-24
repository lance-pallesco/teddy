import "server-only"
import { prisma } from "@/lib/prisma"
import { aiClient } from "@/lib/ai/client"
import { SYSTEM_PROMPT, buildApplicationAnalysisPrompt } from "@/lib/ai/prompts"
import { buildApplicationContext } from "@/lib/ai/context-builder"
import { notificationService } from "@/lib/services/notification.service"

export class AIService {
  private defaultModel: string
  private promptVersion: string

  constructor() {
    this.defaultModel = process.env.AI_MODEL ?? "gpt-4.1-mini"
    this.promptVersion = "1.0.0"
  }

  async getAIInsightForApplication(applicationId: string) {
    return prisma.applicationAIInsight.findUnique({
      where: { applicationId },
    })
  }

  async generateAIInsightForApplication(applicationId: string) {
    const context = await buildApplicationContext(applicationId)
    const userPrompt = buildApplicationAnalysisPrompt(context)
    const response = await aiClient.createChatCompletion({
      model: this.defaultModel,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    })

    const choice = response.choices?.[0]
    if (!choice || !choice.message?.content) {
      throw new Error("Invalid or empty response from AI API completions")
    }

    const rawResponseText = choice.message.content.trim()
    let parsed
    try {
      parsed = JSON.parse(rawResponseText)
    } catch {
      console.error("Failed to parse AI response as JSON. Raw text:", rawResponseText)
      throw new Error("AI response was not valid JSON")
    }
    const summary = parsed.summary ?? "Information not provided."
    const strengths = Array.isArray(parsed.strengths) ? parsed.strengths : []
    const semiFlags = Array.isArray(parsed.semiFlags) ? parsed.semiFlags : []
    const redFlags = Array.isArray(parsed.redFlags) ? parsed.redFlags : []
    const recommendedQuestions = Array.isArray(parsed.recommendedQuestions) ? parsed.recommendedQuestions : []
    const suitabilityScore = typeof parsed.overallSuitability?.score === "number"
      ? parsed.overallSuitability.score
      : (typeof parsed.suitabilityScore === "number" ? parsed.suitabilityScore : 50)

    const insight = await prisma.applicationAIInsight.upsert({
      where: { applicationId },
      create: {
        applicationId,
        model: this.defaultModel,
        promptVersion: this.promptVersion,
        summary,
        strengths,
        semiFlags,
        redFlags,
        recommendedQuestions,
        suitabilityScore,
        rawResponse: rawResponseText,
      },
      update: {
        model: this.defaultModel,
        promptVersion: this.promptVersion,
        summary,
        strengths,
        semiFlags,
        redFlags,
        recommendedQuestions,
        suitabilityScore,
        rawResponse: rawResponseText,
        createdAt: new Date(),
      },
    })

    const application = await prisma.adoptionApplication.findUnique({
      where: { id: applicationId },
      select: {
        status: true,
        applicantId: true,
        pet: {
          select: { name: true },
        },
      },
    })

    if (application && application.status === "PENDING") {
      await prisma.adoptionApplication.update({
        where: { id: applicationId },
        data: { status: "UNDER_REVIEW" },
      })

      // Trigger Notification: Individual Foster


      await notificationService.createNotification(
        application.applicantId,
        "Application Under Review",
        `Your application for ${application.pet.name} is now under active review.`,
        "AI",
        `/applications/${applicationId}`
      )
    }

    return insight
  }
}

export const aiService = new AIService()
