import "server-only"

function generateMockResponse(userMessage: string) {
  // Extract Pet Name
  let petName = "the pet"
  const petMatch = userMessage.match(/"name":\s*"([^"]+)"/)
  if (petMatch) {
    petName = petMatch[1]
  }

  // Extract Applicant Name
  let applicantName = "the applicant"
  const firstNameMatch = userMessage.match(/"firstName":\s*"([^"]+)"/)
  const lastNameMatch = userMessage.match(/"lastName":\s*"([^"]+)"/)
  if (firstNameMatch) {
    applicantName = firstNameMatch[1]
    if (lastNameMatch) {
      applicantName += " " + lastNameMatch[1]
    }
  }

  const isRenting = userMessage.includes('"ownOrRent": "RENT"') || userMessage.includes('"RENT"')
  const hasLandlordPermission = !userMessage.includes('"landlordPermission": false')
  const hasFence = userMessage.includes('"hasFence": true') || userMessage.includes('"fenced": true')
  const hasKids = userMessage.includes('"hasChildren": true') || userMessage.includes('"children": true') || userMessage.includes('"kids"')
  const hasPets = userMessage.includes('"hasPets": true') || (userMessage.includes('"currentPets": [') && !userMessage.includes('"currentPets": []'))
  
  const hoursMatch = userMessage.match(/"hoursLeftAlone":\s*(\d+)/)
  const hoursLeft = hoursMatch ? parseInt(hoursMatch[1], 10) : 4

  // Extract Adoption Commitment fields
  const commitToVetCare = !userMessage.includes('"commitToVetCare": false')
  const whyThisPetMatch = userMessage.match(/"whyThisPet":\s*"([^"]+)"/)
  const whyThisPetText = whyThisPetMatch ? whyThisPetMatch[1] : ""
  const financiallyPreparedMatch = userMessage.match(/"financiallyPrepared":\s*"([^"]+)"/)
  const financiallyPreparedText = financiallyPreparedMatch ? financiallyPreparedMatch[1] : ""

  const strengths: string[] = []
  const semiFlags: any[] = []
  const redFlags: any[] = []
  const questions: string[] = []

  if (hasFence) {
    strengths.push("Has a fully fenced yard, suitable for outdoor exercise.")
  } else {
    semiFlags.push({
      title: "No Fenced Yard",
      severity: "LOW",
      reason: "The applicant does not have a fenced yard, which may limit off-leash play.",
      recommendation: "Discuss leash training and daily exercise routines."
    })
    questions.push("How do you plan to handle outdoor exercise and potty breaks without a fenced yard?")
  }

  if (isRenting) {
    if (!hasLandlordPermission) {
      redFlags.push({
        title: "Landlord Permission Missing",
        severity: "HIGH",
        reason: "The applicant rents and has not confirmed landlord permission for pets.",
        recommendation: "Verify landlord agreement before proceeding."
      })
      questions.push("Can you provide copy of lease or written approval from your landlord allowing this specific pet?")
    } else {
      strengths.push("Rents but has confirmed landlord approval.")
    }
  } else {
    strengths.push("Home owner, reducing lease-related displacement risks.")
  }

  if (hoursLeft > 6) {
    semiFlags.push({
      title: "Long Hours Alone",
      severity: "LOW",
      reason: `Pet would be left alone for ${hoursLeft} hours daily, which might be challenging for high-energy pets.`,
      recommendation: "Inquire about pet-sitting, doggy daycare, or lunch breaks."
    })
    questions.push(`Since you work away for ${hoursLeft} hours, who will check on the pet or walk them during the day?`)
  } else {
    strengths.push("Active presence: pet is not left alone for extended periods.")
  }

  if (hasPets) {
    strengths.push("Experienced pet owner with other animals in the household.")
    questions.push(`How do your current pets get along with other animals?`)
  }

  // Adoption Commitment Analysis
  if (!commitToVetCare) {
    redFlags.push({
      title: "No Veterinary Care Commitment",
      severity: "HIGH",
      reason: "The applicant has indicated they do not commit to providing veterinary care for the pet.",
      recommendation: "Clarify veterinary care preparedness. Adoption should not proceed without veterinary commitment."
    })
    questions.push("Are you willing and financially prepared to provide necessary medical care and regular checkups for the pet?")
  }

  if (financiallyPreparedText) {
    if (financiallyPreparedText.toLowerCase().includes("no") && financiallyPreparedText.length < 15) {
      semiFlags.push({
        title: "Financial Preparation Concerns",
        severity: "LOW",
        reason: "The applicant's financial preparedness description is vague or potentially insufficient.",
        recommendation: "Verify applicant understands the ongoing cost of pet care."
      })
      questions.push("Can you tell us more about how you plan to cover the costs of food, supplies, and veterinary care?")
    } else {
      strengths.push("Expressed clear preparedness for the financial responsibility of pet ownership.")
    }
  }

  if (whyThisPetText && whyThisPetText.length > 30) {
    strengths.push("Highly motivated: detailed strong motivation and reasoning for wanting to adopt this specific pet.")
  }

  if (strengths.length === 0) {
    strengths.push("Expressed strong commitment to pet care and veterinary needs.")
  }
  if (questions.length === 0) {
    questions.push(`What motivated you to adopt ${petName} at this time?`)
  }

  let score = 85
  if (redFlags.length > 0) {
    score = 45
  } else if (semiFlags.length > 0) {
    score = 70
  }

  const confidence = redFlags.length > 0 ? "Medium" : "High"
  
  let label = "Proceed to Interview"
  let reason = "The applicant seems well-suited, pending standard interview verification."
  if (redFlags.length > 0) {
    label = "Caution Suggested"
    reason = "Critical concerns identified regarding landlord permission or housing stability."
  } else if (semiFlags.length > 0) {
    label = "Requires Clarification"
    reason = "A few minor concerns regarding yard security or schedule need to be discussed."
  }

  const contentObj = {
    summary: `${applicantName} is applying to adopt ${petName}. They live in a pet-friendly environment and show a good understanding of pet care responsibilities.`,
    strengths,
    semiFlags,
    redFlags,
    recommendedQuestions: questions,
    overallSuitability: {
      score,
      confidence
    },
    recommendation: {
      label,
      reason
    }
  }

  return {
    choices: [
      {
        message: {
          content: JSON.stringify(contentObj)
        }
      }
    ]
  }
}

export class AIClient {
  private apiKey: string
  private baseUrl: string

  constructor() {
    this.apiKey = process.env.DISTOKENS_API_KEY ?? ""
    this.baseUrl = process.env.DISTOKENS_BASE_URL ?? "https://api.distokens.com/v1"
  }

  async createChatCompletion(options: {
    model: string
    messages: { role: string; content: string }[]
    response_format?: { type: "json_object" }
  }) {
    if (!this.apiKey) {
      console.warn("DISTOKENS_API_KEY environment variable is not set. Generating mock AI response.")
      const userMsg = options.messages.find(m => m.role === "user")?.content ?? ""
      return generateMockResponse(userMsg)
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(options),
      })

      if (!response.ok) {
        const errorBody = await response.text().catch(() => "")
        console.warn(`Distokens AI API request failed: ${response.status} ${response.statusText} - ${errorBody}. Falling back to mock.`)
        const userMsg = options.messages.find(m => m.role === "user")?.content ?? ""
        return generateMockResponse(userMsg)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.warn("Distokens AI call failed. Generating dynamic mock fallback. Error:", error)
      const userMsg = options.messages.find(m => m.role === "user")?.content ?? ""
      return generateMockResponse(userMsg)
    }
  }
}

export const aiClient = new AIClient()
