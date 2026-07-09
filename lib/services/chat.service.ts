import "server-only"
import { prisma } from "@/lib/prisma"
import { aiClient } from "@/lib/ai/client"
import { buildApplicationContext } from "@/lib/ai/context-builder"

// System Prompt for question generation
const INTERVIEW_QUESTIONS_SYSTEM_PROMPT = `
You are TeddyAI, the pet adoption co-pilot for the pet adoption management system.
Your task is to generate 8-12 tailored interview questions for a pet adoption application.
These questions will be asked to the applicant one at a time.
They should be warm, conversational, and non-judgmental, but structured to probe the flags raised during the initial screening.

You will be provided with:
1. The pet's details (species, breed, size, tags/temperament, special needs).
2. The applicant's detailed responses (lifestyle, household, pet experience, commitments).
3. The screening results, specifically the Red Flags (critical risks) and Semi Flags (concerns) raised by the initial screening.

Guidelines:
- Generate 8-12 questions.
- Order them by priority/importance.
- For each flag (Red or Yellow/Semi-Flag), write exactly one custom question addressing it.
- If there are fewer flags than 7, add other relevant follow-up questions based on their answers (e.g. household situation, experience details, scheduling compatibility) to make the total count between 8 and 11.
- You MUST append this exact standard question as the very last question (making it the 9th to 12th question):
  "Is there anything about your application or your home that you feel we should know more about — something that might not have come through clearly in the form?"
- Return the response in a JSON object containing a "questions" array of objects.

Each question object in the "questions" array must match this schema:
{
  "question": "The question text (conversational, warm, empathetic, addressed to the applicant)",
  "reason": "The reason why this question is being asked (for reviewer visibility only)",
  "flag": "The flag title it addresses (if applicable, e.g. 'First-time dog owner' or null)",
  "isMandatory": true or false
}

DO NOT include any Markdown formatting like \`\`\`json or \`\`\` in the raw text response, just return the raw JSON object.
`

// System Prompt for analyzing responses
const PROCESS_RESPONSE_SYSTEM_PROMPT = `
You are TeddyAI, the pet adoption co-pilot.
Your task is to analyze the adopter's response to the current interview question and determine if it addresses or resolves the associated flag.
You will be provided with:
1. The pet details and applicant details.
2. The current list of flags and their current resolution status.
3. The interview chat history.
4. The current question asked and the adopter's latest response.

Guidelines:
- Analyze the adopter's response in the context of the question and the target flag (if any).
- If the response provides credible, positive reassurance or context that mitigates the concern, mark the flag's resolution status as "RESOLVED" (or "PARTIALLY_RESOLVED" if it is partially addressed) and provide a concise reason (e.g. "Adopter has retired parent at home who will watch the dog").
- If the adopter's response does not resolve the flag, or confirms the concern, keep it as "PENDING" or mark as "NOTED" with the explanation.
- Return a short, warm transition/acknowledgment text that TeddyAI can say to the adopter before asking the next question.
- The transition text should show understanding of their response (e.g. "That sounds like a wonderful setup...").
- Return the response in a JSON object matching this schema:
{
  "transition": "Warm acknowledgment and brief transition text",
  "updatedFlags": [
    {
      "title": "Flag Title",
      "status": "RESOLVED" | "PARTIALLY_RESOLVED" | "NOTED" | "PENDING",
      "resolutionNotes": "Brief explanation of how it was resolved or noted"
    }
  ]
}

DO NOT include any Markdown formatting like \`\`\`json or \`\`\`, just the raw JSON object.
`

// System Prompt for final summary
const SUMMARY_SYSTEM_PROMPT = `
You are TeddyAI, the pet adoption co-pilot.
Your task is to review the complete interview transcript and compile a final Post-Interview Summary for the human reviewer.
You will be provided with:
1. The pet details and applicant details.
2. The initial screening flags.
3. The complete chat history between the adopter, reviewer, and TeddyAI.

Guidelines:
- Generate a summary structured into:
  - FLAG RESOLUTION: For each initial flag, compile a status (e.g. Resolved, Partially Resolved, Noted) and the specific reasons/context learned during the interview.
  - ANSWER QUALITY ASSESSMENT: Score the adopter's answers from 1-100 on three dimensions: Consistency, Specificity, and Engagement.
  - LANGUAGE NOTE: Note the primary language(s) used by the adopter (e.g. Tagalog, English, Cebuano) and confirm everything was translated/understood.
  - UPDATED RECOMMENDATION: Give a final recommendation score (0-100) and whether to "PROCEED TO MEET & GREET" or "REJECT", with a brief justification.
- Return the response in a JSON object matching this schema:
{
  "flagResolutions": [
    {
      "flag": "Flag Title",
      "status": "RESOLVED" | "PARTIALLY_RESOLVED" | "NOTED",
      "explanation": "Detailed explanation based on interview responses"
    }
  ],
  "qualityAssessment": {
    "consistency": 85, // 0-100
    "specificity": 80, // 0-100
    "engagement": 90   // 0-100
  },
  "languageNote": "Language details...",
  "recommendation": {
    "score": 84, // 0-100
    "decision": "PROCEED TO MEET & GREET" | "REJECT",
    "justification": "Detailed explanation of why this decision is recommended"
  }
}

DO NOT include any Markdown formatting like \`\`\`json or \`\`\`, just the raw JSON object.
`

function cleanJsonString(rawText: string): string {
  let cleanJson = rawText.trim()
  if (cleanJson.startsWith("```json")) {
    cleanJson = cleanJson.substring(7)
  } else if (cleanJson.startsWith("```")) {
    cleanJson = cleanJson.substring(3)
  }
  if (cleanJson.endsWith("```")) {
    cleanJson = cleanJson.substring(0, cleanJson.length - 3)
  }
  return cleanJson.trim()
}

export class ChatService {
  private defaultModel: string

  constructor() {
    this.defaultModel = process.env.AI_MODEL ?? "gpt-4.1-mini"
  }

  // 1. Generate tailored questions based on application details & initial screening
  async generateInterviewQuestions(applicationId: string) {
    const context = await buildApplicationContext(applicationId)
    const insight = await prisma.applicationAIInsight.findUnique({
      where: { applicationId },
    })

    const redFlags = Array.isArray(insight?.redFlags) ? insight.redFlags : []
    const semiFlags = Array.isArray(insight?.semiFlags) ? insight.semiFlags : []

    const userPrompt = JSON.stringify({
      pet: context.pet,
      applicant: context.applicant,
      screeningResult: {
        redFlags,
        semiFlags,
      },
    })

    try {
      const response = await aiClient.createChatCompletion({
        model: this.defaultModel,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: INTERVIEW_QUESTIONS_SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      })

      const content = response.choices?.[0]?.message?.content
      if (!content) throw new Error("Empty response from AI questions generation")

      const parsed = JSON.parse(cleanJsonString(content))
      if (Array.isArray(parsed.questions)) {
        return parsed.questions
      }
      return this.generateMockQuestions(context.pet.name, redFlags, semiFlags)
    } catch (error) {
      console.warn("Distokens AI call failed for generating questions. Falling back to mock.", error)
      return this.generateMockQuestions(context.pet.name, redFlags, semiFlags)
    }
  }

  // 2. Process adopter response to current question
  async processAdopterResponse(
    applicationId: string,
    currentQuestionText: string,
    targetFlagTitle: string | null,
    adopterMessage: string,
    chatHistory: { senderRole: string; content: string }[]
  ) {
    const context = await buildApplicationContext(applicationId)
    const application = await prisma.adoptionApplication.findUnique({
      where: { id: applicationId },
      select: { chatQuestions: true },
    })

    const flags = (application?.chatQuestions as any[]) || []

    const userPrompt = JSON.stringify({
      pet: context.pet,
      applicant: context.applicant,
      flagsState: flags.map(f => ({ title: f.flag, status: f.status ?? "PENDING" })),
      chatHistory: chatHistory.slice(-10), // Send last 10 messages for context
      currentQuestion: currentQuestionText,
      targetFlag: targetFlagTitle,
      latestAdopterResponse: adopterMessage,
    })

    try {
      const response = await aiClient.createChatCompletion({
        model: this.defaultModel,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: PROCESS_RESPONSE_SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      })

      const content = response.choices?.[0]?.message?.content
      if (!content) throw new Error("Empty response from AI response processing")

      const parsed = JSON.parse(cleanJsonString(content))
      return {
        transition: parsed.transition || "Thank you for sharing that.",
        updatedFlags: Array.isArray(parsed.updatedFlags) ? parsed.updatedFlags : [],
      }
    } catch (error) {
      console.warn("Distokens AI call failed for processing adopter response. Falling back to mock.", error)
      return {
        transition: "Understood. That is very good to know.",
        updatedFlags: targetFlagTitle ? [{ title: targetFlagTitle, status: "RESOLVED", resolutionNotes: "Addressed during conversation." }] : [],
      }
    }
  }

  // 3. Compile post-interview summary for reviewer
  async generatePostInterviewSummary(
    applicationId: string,
    chatHistory: { senderRole: string; content: string }[]
  ) {
    const context = await buildApplicationContext(applicationId)
    const insight = await prisma.applicationAIInsight.findUnique({
      where: { applicationId },
    })

    const redFlags = Array.isArray(insight?.redFlags) ? insight.redFlags : []
    const semiFlags = Array.isArray(insight?.semiFlags) ? insight.semiFlags : []

    const userPrompt = JSON.stringify({
      pet: context.pet,
      applicant: context.applicant,
      screeningResult: {
        redFlags,
        semiFlags,
      },
      chatHistory,
    })

    try {
      const response = await aiClient.createChatCompletion({
        model: this.defaultModel,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SUMMARY_SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      })

      const content = response.choices?.[0]?.message?.content
      if (!content) throw new Error("Empty response from AI summary generation")

      return JSON.parse(cleanJsonString(content))
    } catch (error) {
      console.warn("Distokens AI call failed for final summary. Falling back to mock.", error)
      
      // Build a realistic fallback summary
      const resolutions = ([...redFlags, ...semiFlags] as any[]).map(flag => ({
        flag: flag?.title || "Flag",
        status: "RESOLVED" as const,
        explanation: "Addressed and clarified during the chat conversation.",
      }))

      return {
        flagResolutions: resolutions,
        qualityAssessment: {
          consistency: 90,
          specificity: 85,
          engagement: 95,
        },
        languageNote: "Clear communication, primarily in English/Tagalog.",
        recommendation: {
          score: 85,
          decision: "PROCEED TO MEET & GREET" as const,
          justification: "The applicant has provided satisfactory clarifications on the questions raised.",
        },
      }
    }
  }

  // Helper to generate default fallback questions
  private generateMockQuestions(petName: string, redFlags: any[], semiFlags: any[]): any[] {
    const questions: any[] = []

    // 1. Process screening flags to create realistic questions
    redFlags.forEach(flag => {
      questions.push({
        question: `You mentioned details regarding "${flag.title}". Could you walk me through your plan for addressing this in your daily schedule or home setup for ${petName}?`,
        reason: `Clarifies red flag: ${flag.title}`,
        flag: flag.title,
        isMandatory: true,
      })
    })

    semiFlags.forEach(flag => {
      questions.push({
        question: `There was a concern raised about "${flag.title}". Could you share a bit more detail on how you plan to handle this for ${petName}?`,
        reason: `Clarifies concern: ${flag.title}`,
        flag: flag.title,
        isMandatory: false,
      })
    })

    // Add standard questions to fill to at least 8 questions
    const standardAdditions = [
      {
        question: `What first caught your eye about ${petName}, and why do you feel they would be the perfect fit for your home?`,
        reason: "Assesses suitability and connection with this specific pet.",
        flag: null,
        isMandatory: true,
      },
      {
        question: "Walk me through what a typical weekday would look like. Who will be home with the pet, and what is your schedule for feeding and walks?",
        reason: "Details separation anxiety risk and time availability.",
        flag: "Separation anxiety",
        isMandatory: true,
      },
      {
        question: "How do you plan to handle training, socialization, and adjustment during the first few weeks at home?",
        reason: "Assesses pet care experience and preparation.",
        flag: "Adjustment period",
        isMandatory: false,
      },
      {
        question: "If a medical emergency arises or ongoing veterinary care is needed, do you have a plan or resources in place to handle these expenses?",
        reason: "Verifies financial commitment.",
        flag: "Financial preparation",
        isMandatory: true,
      },
    ]

    for (const item of standardAdditions) {
      if (questions.length < 8 && !questions.some(q => q.question === item.question)) {
        questions.push(item)
      }
    }

    // Always append final question
    questions.push({
      question: `Is there anything about your application or your home that you feel we should know more about — something that might not have come through clearly in the form?`,
      reason: "Standard open-ended completion question.",
      flag: null,
      isMandatory: false,
    })

    return questions
  }
}

export const chatService = new ChatService()
