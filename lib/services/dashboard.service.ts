import "server-only"

import { prisma } from "@/lib/prisma"
import { AdoptionStatus, Role, PetStatus } from "@prisma/client"

export async function getShelterStats() {
  const [active, inactive] = await Promise.all([
    prisma.shelter.count({ where: { isActive: true } }),
    prisma.shelter.count({ where: { isActive: false } }),
  ])
  return { active, inactive, total: active + inactive }
}

export async function getUserStats() {
  const groups = await prisma.user.groupBy({
    by: ["role"],
    _count: { _all: true },
  })
  const breakdown: Record<Role, number> = {
    ADMIN: 0,
    SHELTER_STAFF: 0,
    PET_OWNER: 0,
    ADOPTER: 0,
  }
  groups.forEach((g) => {
    breakdown[g.role] = g._count._all
  })
  return breakdown
}

export async function getPetStats() {
  const groups = await prisma.pet.groupBy({
    by: ["status"],
    _count: { _all: true },
  })
  const breakdown: Record<PetStatus, number> = {
    AVAILABLE: 0,
    PENDING: 0,
    ADOPTED: 0,
    RESERVED: 0,
    MEDICAL_HOLD: 0,
    ARCHIVED: 0,
  }
  groups.forEach((g) => {
    breakdown[g.status] = g._count._all
  })
  return breakdown
}

export async function getMonthlyApplicationStats() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  return prisma.adoptionApplication.count({
    where: {
      deletedAt: null,
      status: { not: "DRAFT" },
      submittedAt: { gte: startOfMonth },
    },
  })
}

export async function getSuperAdminStats() {
  const [shelters, users, pets, applicationsThisMonth] = await Promise.all([
    getShelterStats(),
    getUserStats(),
    getPetStats(),
    getMonthlyApplicationStats(),
  ])

  return {
    shelters,
    users,
    pets,
    applicationsThisMonth,
  }
}

export async function getShelterStaffStats(shelterId: string) {
  const now = new Date()
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(now.getDate() - 7)
  sevenDaysAgo.setHours(0, 0, 0, 0)

  const [shelter, availablePets, pendingApps, totalAdoptions, appsThisWeek] = await Promise.all([
    prisma.shelter.findUnique({
      where: { id: shelterId },
      select: { name: true, isActive: true },
    }),
    prisma.pet.count({
      where: {
        shelterId,
        status: "AVAILABLE",
      },
    }),
    prisma.adoptionApplication.count({
      where: {
        deletedAt: null,
        status: "PENDING",
        pet: { shelterId },
      },
    }),
    prisma.adoptionApplication.count({
      where: {
        deletedAt: null,
        status: "APPROVED",
        pet: { shelterId },
      },
    }),
    prisma.adoptionApplication.count({
      where: {
        deletedAt: null,
        status: { not: "DRAFT" },
        submittedAt: { gte: sevenDaysAgo },
        pet: { shelterId },
      },
    }),
  ])

  return {
    shelterName: shelter?.name ?? "My Shelter",
    shelterActive: shelter?.isActive ?? false,
    availablePets,
    pendingApps,
    totalAdoptions,
    appsThisWeek,
  }
}

export async function getPetOwnerStats(userId: string) {
  const now = new Date()
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(now.getDate() - 7)
  sevenDaysAgo.setHours(0, 0, 0, 0)

  const [petGroups, appsThisWeek] = await Promise.all([
    prisma.pet.groupBy({
      by: ["status"],
      where: { postedById: userId },
      _count: { _all: true },
    }),
    prisma.adoptionApplication.count({
      where: {
        deletedAt: null,
        status: { not: "DRAFT" },
        submittedAt: { gte: sevenDaysAgo },
        pet: { postedById: userId },
      },
    }),
  ])

  const petBreakdown: Record<PetStatus, number> = {
    AVAILABLE: 0,
    PENDING: 0,
    ADOPTED: 0,
    RESERVED: 0,
    MEDICAL_HOLD: 0,
    ARCHIVED: 0,
  }
  petGroups.forEach((g) => {
    petBreakdown[g.status] = g._count._all
  })

  return {
    pets: petBreakdown,
    appsThisWeek,
  }
}

export async function getAdopterStats(userId: string) {
  const appGroups = await prisma.adoptionApplication.groupBy({
    by: ["status"],
    where: {
      applicantId: userId,
      deletedAt: null,
    },
    _count: { _all: true },
  })

  const appBreakdown: Record<AdoptionStatus, number> = {
    DRAFT: 0,
    PENDING: 0,
    UNDER_REVIEW: 0,
    INTERVIEW_IN_PROGRESS: 0,
    APPROVED: 0,
    REJECTED: 0,
    WITHDRAWN: 0,
  }
  appGroups.forEach((g) => {
    appBreakdown[g.status] = g._count._all
  })

  return {
    applications: appBreakdown,
    interviewsScheduled: appBreakdown.UNDER_REVIEW > 0 ? 1 : 0, 
  }
}

export async function getRecentPets(limit: number = 3) {
  return prisma.pet.findMany({
    where: {
      status: "AVAILABLE",
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
    include: {
      petImages: {
        orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
      },
      shelter: {
        select: {
          name: true,
        },
      },
      postedBy: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  })
}
