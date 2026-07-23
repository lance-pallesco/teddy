"use server"

import { aiClient } from "@/lib/ai/client"
import { getCurrentUser } from "@/lib/auth/session"
import { getPets, type PetListItem } from "@/lib/services/pet.service"
import { prisma } from "@/lib/prisma"

export type MatchAnswers = {
  species: "DOG" | "CAT" | "RABBIT" | "BIRD" | "ANY"
  environment: "APARTMENT" | "TOWNHOUSE" | "HOUSE_YARD"
  schedule: "HOME" | "GONE_MODERATE" | "GONE_LONG"
  activity: "LOW" | "MODERATE" | "HIGH"
  experience: "NONE" | "SOME" | "EXPERT"
}

export type MatchResult = {
  pet: PetListItem & { description: string | null }
  score: number
  reason: string
}

function selectFallbackMatches(pets: PetListItem[], answers: MatchAnswers) {
  return pets
    .map((pet) => {
      let score = 75
      const reasons: string[] = []

      // 1. Species compatibility
      if (answers.species !== "ANY" && pet.species !== answers.species) {
        score -= 35
        reasons.push(`You preferred a ${answers.species.toLowerCase()} but ${pet.name} is a ${pet.species.toLowerCase()}.`)
      } else {
        score += 10
        reasons.push(`${pet.name} is a ${pet.species.toLowerCase()}, which perfectly matches your preference.`)
      }

      // 2. Environment compatibility
      if (answers.environment === "APARTMENT" && pet.size === "LARGE") {
        score -= 15
        reasons.push(`Large pets like ${pet.name} can sometimes feel cramped in an apartment setting.`)
      } else if (answers.environment === "HOUSE_YARD") {
        score += 10
        reasons.push(`Your house with a yard gives ${pet.name} plenty of room to explore.`)
      } else {
        reasons.push(`Your living setup is comfortable for a pet of ${pet.name}'s size.`)
      }

      // 3. Activity / Energy compatibility
      const isDog = pet.species === "DOG"
      if (answers.activity === "LOW" && isDog) {
        score -= 10
        reasons.push(`${pet.name} might need more active exercise than your relaxed schedule typically allows.`)
      } else if (answers.activity === "HIGH" && isDog) {
        score += 15
        reasons.push(`Your active lifestyle matches well with ${pet.name}'s energy requirements.`)
      } else {
        reasons.push(`${pet.name} adapts well to moderate daily physical routines.`)
      }

      score = Math.max(40, Math.min(99, score))

      return {
        petId: pet.id,
        score,
        reason: reasons.join(" ")
      }
    })
    .sort((a, b) => b.score - a.score)
}

export async function findMyMatchesAction(answers: MatchAnswers): Promise<{ success: boolean; data?: MatchResult[]; error?: string }> {
  try {
    const user = await getCurrentUser()
    const result = await getPets(
      { userId: user?.id || "", role: "ADOPTER", shelterId: null },
      { tab: "active" },
      1,
      100
    )
    const pets = result.pets

    if (pets.length === 0) {
      return { success: true, data: [] }
    }

    // Fetch descriptions for the pets
    const petDetails = await prisma.pet.findMany({
      where: {
        id: { in: pets.map(p => p.id) }
      },
      select: {
        id: true,
        description: true
      }
    })

    const userPrompt = `
Given an adopter's lifestyle preferences and a list of available pets in our shelter system, evaluate compatibility for each pet and return a compatibility percentage (0-100) and a customized 2-3 sentence explanation detailing why the pet is a match (or why it might have challenges) for this specific adopter.

ADOPTER PREFERENCES:
- Open to: ${answers.species}
- Living environment: ${answers.environment} (Apartment/Condo, Townhouse, or House with Yard)
- Daily schedule: ${answers.schedule} (Mostly home, Gone 4-8 hours, or Gone 8+ hours)
- Household activity level: ${answers.activity} (Low/Relaxed, Moderate, or High/Active)
- Experience level: ${answers.experience} (First-time owner, Some experience, or Experienced owner)

AVAILABLE PETS:
${JSON.stringify(pets.map(p => {
  const details = petDetails.find(d => d.id === p.id)
  return {
    id: p.id,
    name: p.name,
    species: p.species,
    breed: p.breed,
    gender: p.gender,
    size: p.size,
    location: p.location,
    description: details?.description || ""
  }
}), null, 2)}

Return your analysis in a STRICT JSON format containing a "matches" key which points to an array of objects. Do not output any markdown blocks, introductory text, or explanation outside the JSON.
REQUIRED JSON SCHEMA:
{
  "matches": [
    {
      "petId": "pet_uuid_here",
      "score": 95,
      "reason": "Explain why this pet fits the adopter's home and schedule."
    }
  ]
}
`

    const model = process.env.AI_MODEL ?? "gpt-4.1-mini"
    const response = await aiClient.createChatCompletion({
      model,
      messages: [
        { role: "system", content: "You are TeddyAI, the expert pet adoption matching assistant." },
        { role: "user", content: userPrompt },
      ],
    })

    const content = response.choices?.[0]?.message?.content?.trim() || ""
    
    let aiMatches: { petId: string; score: number; reason: string }[] = []
    
    try {
      const jsonText = content.startsWith("```") 
        ? content.replace(/```json|```/g, "").trim()
        : content
      const parsed = JSON.parse(jsonText)
      if (Array.isArray(parsed.matches)) {
        aiMatches = parsed.matches
      } else {
        throw new Error("No matches array in AI response")
      }
    } catch (parseError) {
      console.warn("Could not parse AI match output, falling back to smart filter logic. Raw content:", content)
      aiMatches = selectFallbackMatches(pets, answers)
    }

    const matchedResults: MatchResult[] = aiMatches
      .map((item) => {
        const petRecord = pets.find((p) => p.id === item.petId)
        if (!petRecord) return null

        const details = petDetails.find(d => d.id === item.petId)

        return {
          pet: {
            ...petRecord,
            description: details?.description || null
          },
          score: item.score,
          reason: item.reason,
        }
      })
      .filter((item): item is MatchResult => item !== null)
      .sort((a, b) => b.score - a.score)

    return { success: true, data: matchedResults }
  } catch (error: any) {
    console.error("Error in findMyMatchesAction:", error)
    return { success: false, error: error.message || "An unexpected error occurred during matching." }
  }
}
