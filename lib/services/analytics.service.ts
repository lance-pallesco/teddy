import { prisma } from "@/lib/prisma"

export type AnalyticsData = {
  totalPets: number
  activePets: number
  adoptedPets: number
  totalApplications: number
  approvedApplications: number
  avgDaysToAdopt: number
  
  // Weekly application counts for the last 8 weeks
  weeklyApplications: { name: string; Applications: number }[]
  
  // Application pipeline status funnel
  pipelineData: { name: string; value: number; percentage: string; fill: string }[]
  
  // Species distribution counts
  speciesData: { name: string; value: number }[]
  
  // Top shelters by successful adoption counts
  shelterData: { name: string; Adoptions: number }[]
}

export async function getAnalyticsData(): Promise<AnalyticsData> {
  const [pets, applications] = await Promise.all([
    prisma.pet.findMany({
      select: {
        id: true,
        species: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        shelterId: true,
        shelter: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.adoptionApplication.findMany({
      select: {
        id: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        pet: {
          select: {
            shelter: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    }),
  ])

  const totalPets = pets.length
  const activePets = pets.filter((p) => ["AVAILABLE", "PENDING"].includes(p.status)).length
  const adoptedPets = pets.filter((p) => p.status === "ADOPTED").length
  const totalApplications = applications.length
  const approvedApplications = applications.filter((a) => a.status === "APPROVED").length

  // Calculate Average Days to Adopt
  const adoptedPetsList = pets.filter((p) => p.status === "ADOPTED")
  const totalDays = adoptedPetsList.reduce((sum, p) => {
    const start = new Date(p.createdAt).getTime()
    const end = new Date(p.updatedAt).getTime()
    const diffDays = Math.max(0, Math.round((end - start) / (1000 * 60 * 60 * 24)))
    return sum + diffDays
  }, 0)
  const avgDaysToAdopt = adoptedPetsList.length > 0 ? Math.round(totalDays / adoptedPetsList.length) : 0

  // Calculate Weekly Trend (Last 8 Weeks)
  const weeks: Record<string, number> = {}
  const now = new Date()
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i * 7)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // monday of that week
    const monday = new Date(d.setDate(diff))
    const label = `Week of ${monday.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
    weeks[label] = 0
  }

  applications.forEach((a) => {
    const d = new Date(a.createdAt)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(d.setDate(diff))
    const label = `Week of ${monday.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
    if (weeks[label] !== undefined) {
      weeks[label]++
    }
  })
  const weeklyApplications = Object.entries(weeks).map(([name, count]) => ({
    name,
    Applications: count,
  }))

  // Calculate Conversion Funnel Data
  const totalSubmitted = applications.filter((a) => a.status !== "DRAFT").length
  const screening = applications.filter((a) =>
    ["UNDER_REVIEW", "INTERVIEW_IN_PROGRESS", "APPROVED"].includes(a.status)
  ).length
  const interviews = applications.filter((a) =>
    ["INTERVIEW_IN_PROGRESS", "APPROVED"].includes(a.status)
  ).length
  const approvedCount = applications.filter((a) => a.status === "APPROVED").length

  const pipelineData = [
    { name: "Submitted", value: totalSubmitted, percentage: "100%", fill: "#3b82f6" },
    {
      name: "Screening",
      value: screening,
      percentage: totalSubmitted ? `${Math.round((screening / totalSubmitted) * 100)}%` : "0%",
      fill: "#0ea5e9",
    },
    {
      name: "Interview",
      value: interviews,
      percentage: totalSubmitted ? `${Math.round((interviews / totalSubmitted) * 100)}%` : "0%",
      fill: "#8b5cf6",
    },
    {
      name: "Approved",
      value: approvedCount,
      percentage: totalSubmitted ? `${Math.round((approvedCount / totalSubmitted) * 100)}%` : "0%",
      fill: "#10b981",
    },
  ]

  // Calculate Species Distribution
  const speciesCounts: Record<string, number> = { DOG: 0, CAT: 0, RABBIT: 0, BIRD: 0, OTHER: 0 }
  pets.forEach((p) => {
    if (speciesCounts[p.species] !== undefined) {
      speciesCounts[p.species]++
    } else {
      speciesCounts.OTHER++
    }
  })
  const speciesData = Object.entries(speciesCounts)
    .map(([name, value]) => ({
      name: name.charAt(0) + name.slice(1).toLowerCase(),
      value,
    }))
    .filter((d) => d.value > 0)

  // Calculate Shelter Standings
  const shelterAdoptions: Record<string, number> = {}
  pets.forEach((p) => {
    if (p.status === "ADOPTED" && p.shelter) {
      const name = p.shelter.name
      shelterAdoptions[name] = (shelterAdoptions[name] || 0) + 1
    }
  })
  const shelterData = Object.entries(shelterAdoptions)
    .map(([name, count]) => ({
      name,
      Adoptions: count,
    }))
    .sort((a, b) => b.Adoptions - a.Adoptions)
    .slice(0, 5)

  return {
    totalPets,
    activePets,
    adoptedPets,
    totalApplications,
    approvedApplications,
    avgDaysToAdopt,
    weeklyApplications,
    pipelineData,
    speciesData,
    shelterData,
  }
}

export type ShelterAnalyticsData = {
  totalPets: number
  activePets: number
  adoptedPets: number
  totalApplications: number
  pendingApplications: number
  avgDaysToAdopt: number
  weeklyApplications: { name: string; Applications: number }[]
  statusDistribution: { name: string; value: number }[]
}

export async function getShelterAnalyticsData(shelterId: string): Promise<ShelterAnalyticsData> {
  const [pets, applications] = await Promise.all([
    prisma.pet.findMany({
      where: { shelterId },
      select: {
        id: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.adoptionApplication.findMany({
      where: {
        pet: { shelterId },
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
      },
    }),
  ])

  const totalPets = pets.length
  const activePets = pets.filter((p) => ["AVAILABLE", "PENDING"].includes(p.status)).length
  const adoptedPets = pets.filter((p) => p.status === "ADOPTED").length
  const totalApplications = applications.length
  const pendingApplications = applications.filter((a) =>
    ["PENDING", "UNDER_REVIEW"].includes(a.status)
  ).length

  const adoptedPetsList = pets.filter((p) => p.status === "ADOPTED")
  const totalDays = adoptedPetsList.reduce((sum, p) => {
    const start = new Date(p.createdAt).getTime()
    const end = new Date(p.updatedAt).getTime()
    const diffDays = Math.max(0, Math.round((end - start) / (1000 * 60 * 60 * 24)))
    return sum + diffDays
  }, 0)
  const avgDaysToAdopt = adoptedPetsList.length > 0 ? Math.round(totalDays / adoptedPetsList.length) : 0

  const weeks: Record<string, number> = {}
  const now = new Date()
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i * 7)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(d.setDate(diff))
    const label = `Week of ${monday.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
    weeks[label] = 0
  }

  applications.forEach((a) => {
    const d = new Date(a.createdAt)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(d.setDate(diff))
    const label = `Week of ${monday.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
    if (weeks[label] !== undefined) {
      weeks[label]++
    }
  })
  const weeklyApplications = Object.entries(weeks).map(([name, count]) => ({
    name,
    Applications: count,
  }))

  const statusCounts: Record<string, number> = { AVAILABLE: 0, PENDING: 0, ADOPTED: 0, OTHER: 0 }
  pets.forEach((p) => {
    if (statusCounts[p.status] !== undefined) {
      statusCounts[p.status]++
    } else {
      statusCounts.OTHER++
    }
  })
  const statusDistribution = Object.entries(statusCounts)
    .map(([name, value]) => ({
      name: name.charAt(0) + name.slice(1).toLowerCase(),
      value,
    }))
    .filter((d) => d.value > 0)

  return {
    totalPets,
    activePets,
    adoptedPets,
    totalApplications,
    pendingApplications,
    avgDaysToAdopt,
    weeklyApplications,
    statusDistribution,
  }
}

export type PetOwnerAnalyticsData = {
  totalPets: number
  activePets: number
  adoptedPets: number
  totalApplications: number
  pendingApplications: number
  pipelineData: { name: string; value: number; percentage: string; fill: string }[]
}

export async function getPetOwnerAnalyticsData(ownerId: string): Promise<PetOwnerAnalyticsData> {
  const [pets, applications] = await Promise.all([
    prisma.pet.findMany({
      where: { postedById: ownerId },
      select: {
        id: true,
        status: true,
      },
    }),
    prisma.adoptionApplication.findMany({
      where: {
        pet: { postedById: ownerId },
      },
      select: {
        id: true,
        status: true,
      },
    }),
  ])

  const totalPets = pets.length
  const activePets = pets.filter((p) => ["AVAILABLE", "PENDING"].includes(p.status)).length
  const adoptedPets = pets.filter((p) => p.status === "ADOPTED").length
  const totalApplications = applications.length
  const pendingApplications = applications.filter((a) =>
    ["PENDING", "UNDER_REVIEW"].includes(a.status)
  ).length

  const totalSubmitted = applications.filter((a) => a.status !== "DRAFT").length
  const screening = applications.filter((a) =>
    ["UNDER_REVIEW", "INTERVIEW_IN_PROGRESS", "APPROVED"].includes(a.status)
  ).length
  const interviews = applications.filter((a) =>
    ["INTERVIEW_IN_PROGRESS", "APPROVED"].includes(a.status)
  ).length
  const approvedCount = applications.filter((a) => a.status === "APPROVED").length

  const pipelineData = [
    { name: "Submitted", value: totalSubmitted, percentage: "100%", fill: "#3b82f6" },
    {
      name: "Screening",
      value: screening,
      percentage: totalSubmitted ? `${Math.round((screening / totalSubmitted) * 100)}%` : "0%",
      fill: "#0ea5e9",
    },
    {
      name: "Interview",
      value: interviews,
      percentage: totalSubmitted ? `${Math.round((interviews / totalSubmitted) * 100)}%` : "0%",
      fill: "#8b5cf6",
    },
    {
      name: "Approved",
      value: approvedCount,
      percentage: totalSubmitted ? `${Math.round((approvedCount / totalSubmitted) * 100)}%` : "0%",
      fill: "#10b981",
    },
  ]

  return {
    totalPets,
    activePets,
    adoptedPets,
    totalApplications,
    pendingApplications,
    pipelineData,
  }
}

