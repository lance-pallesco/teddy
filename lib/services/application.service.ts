import "server-only"

import { prisma } from "@/lib/prisma"
import { AdoptionStatus } from "@prisma/client"

export class ApplicationNotFoundError extends Error {
  constructor(message = "Adoption application not found.") {
    super(message)
    this.name = "ApplicationNotFoundError"
  }
}

export class PetNotAvailableError extends Error {
  constructor(message = "This pet is no longer available for adoption.") {
    super(message)
    this.name = "PetNotAvailableError"
  }
}

export async function getApplicationById(id: string) {
  return prisma.adoptionApplication.findUnique({
    where: { id },
    include: {
      pet: {
        include: {
          petImages: {
            orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
          },
          shelter: true,
          postedBy: true,
        },
      },
      documents: true,
    },
  })
}

export async function getAdopterDrafts(adopterId: string) {
  return prisma.adoptionApplication.findMany({
    where: {
      applicantId: adopterId,
      status: "DRAFT",
    },
    include: {
      pet: {
        include: {
          petImages: {
            where: { isPrimary: true },
            take: 1,
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  })
}

export async function checkExistingApplication(petId: string, applicantId: string) {
  return prisma.adoptionApplication.findFirst({
    where: {
      petId,
      applicantId,
      deletedAt: null,
    },
    select: {
      id: true,
      status: true,
      currentStep: true,
    },
  })
}

export async function createDraftApplication(petId: string, applicantId: string) {
  return prisma.adoptionApplication.create({
    data: {
      petId,
      applicantId,
      status: "DRAFT",
      currentStep: 1,
    },
    select: {
      id: true,
      currentStep: true,
    },
  })
}

export async function saveDraftStep(
  applicationId: string,
  step: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
) {
  const application = await prisma.adoptionApplication.findUnique({
    where: { id: applicationId },
    select: { id: true, currentStep: true },
  })

  if (!application) {
    throw new ApplicationNotFoundError()
  }

  // Map step number to column
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: Record<string, any> = {}
  if (step === 2) {
    updateData.livingEnvironment = data
  } else if (step === 3) {
    updateData.householdLifestyle = data
  } else if (step === 4) {
    updateData.petExperience = data
  } else if (step === 5) {
    updateData.adoptionCommitment = data
  } else if (step === 7) {
    updateData.agreements = data
  }

  // Update step if moving forward
  updateData.currentStep = Math.max(application.currentStep, step)

  return prisma.adoptionApplication.update({
    where: { id: applicationId },
    data: updateData,
  })
}

export async function submitApplication(applicationId: string, applicantId: string) {
  return prisma.$transaction(async (tx) => {
    // 1. Fetch application
    const app = await tx.adoptionApplication.findUnique({
      where: { id: applicationId },
      include: {
        pet: true,
        documents: true,
      },
    })

    if (!app) {
      throw new ApplicationNotFoundError()
    }

    if (app.applicantId !== applicantId) {
      throw new Error("Unauthorized access to this application.")
    }

    if (app.status !== "DRAFT") {
      throw new Error("Application has already been submitted.")
    }

    // 2. Verify Pet status is AVAILABLE
    if (app.pet.status !== "AVAILABLE") {
      throw new PetNotAvailableError()
    }

    // 3. Update AdoptionApplication
    const updatedApp = await tx.adoptionApplication.update({
      where: { id: applicationId },
      data: {
        status: "PENDING",
        submittedAt: new Date(),
      },
    })

    return updatedApp
  })
}

export async function deleteApplicationDraft(applicationId: string, applicantId: string) {
  const app = await prisma.adoptionApplication.findUnique({
    where: { id: applicationId },
    select: { applicantId: true, status: true },
  })

  if (!app) {
    throw new ApplicationNotFoundError()
  }

  if (app.applicantId !== applicantId) {
    throw new Error("Unauthorized.")
  }

  if (app.status !== "DRAFT") {
    throw new Error("Cannot delete a submitted application.")
  }

  return prisma.adoptionApplication.delete({
    where: { id: applicationId },
  })
}

// ---------------------------------------------------------------------------
// Applications listing
// ---------------------------------------------------------------------------

import type { ApplicationTab } from "@/lib/utils/application-list"
import type { Role } from "@prisma/client"

const ACTIVE_STATUSES: AdoptionStatus[] = ["PENDING", "UNDER_REVIEW"]
const COMPLETED_STATUSES: AdoptionStatus[] = ["APPROVED", "REJECTED", "WITHDRAWN"]

type ApplicantApplicationItem = {
  id: string
  status: AdoptionStatus
  submittedAt: Date | null
  createdAt: Date
  pet: {
    id: string
    name: string
    primaryImageUrl: string | null
    postedBy: { firstName: string; lastName: string } | null
    shelter: { name: string } | null
  }
}

export type ApplicantApplicationListResult = {
  applications: ApplicantApplicationItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export async function getApplicationsByApplicant(
  applicantId: string,
  tab: ApplicationTab = "all",
  page: number = 1,
  limit: number = 10
): Promise<ApplicantApplicationListResult> {
  const statusFilter: AdoptionStatus[] | undefined =
    tab === "active"
      ? ACTIVE_STATUSES
      : tab === "completed"
        ? COMPLETED_STATUSES
        : undefined

  const where = {
    applicantId,
    deletedAt: null,
    status: statusFilter
      ? { in: statusFilter }
      : { not: "DRAFT" as AdoptionStatus },
  }

  const skip = (page - 1) * limit

  const [total, records] = await Promise.all([
    prisma.adoptionApplication.count({ where }),
    prisma.adoptionApplication.findMany({
      where,
      select: {
        id: true,
        status: true,
        submittedAt: true,
        createdAt: true,
        pet: {
          select: {
            id: true,
            name: true,
            petImages: {
              where: { isPrimary: true },
              take: 1,
              select: { url: true },
            },
            postedBy: {
              select: { firstName: true, lastName: true },
            },
            shelter: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      skip,
      take: limit,
    }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return {
    applications: records.map((r) => ({
      id: r.id,
      status: r.status,
      submittedAt: r.submittedAt,
      createdAt: r.createdAt,
      pet: {
        id: r.pet.id,
        name: r.pet.name,
        primaryImageUrl: r.pet.petImages[0]?.url ?? null,
        postedBy: r.pet.postedBy,
        shelter: r.pet.shelter,
      },
    })),
    total,
    page,
    pageSize: limit,
    totalPages,
  }
}

// -- Incoming applications for SHELTER_STAFF / PET_OWNER --

type PetOwnerSession = {
  userId: string
  role: Role
  shelterId: string | null
}

type PetOwnerFilters = {
  status?: AdoptionStatus
  petId?: string
}

type IncomingApplicationItem = {
  id: string
  status: AdoptionStatus
  submittedAt: Date | null
  createdAt: Date
  applicant: { firstName: string; lastName: string; avatar: string }
  pet: {
    id: string
    name: string
    primaryImageUrl: string | null
    postedBy: { firstName: string; lastName: string } | null
    shelter: { name: string } | null
  }
}

export type IncomingApplicationListResult = {
  applications: IncomingApplicationItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export async function getApplicationsByPetOwner(
  session: PetOwnerSession,
  filters: PetOwnerFilters = {},
  page: number = 1,
  limit: number = 10
): Promise<IncomingApplicationListResult> {
  const petOwnershipWhere =
    session.role === "SHELTER_STAFF" && session.shelterId
      ? { pet: { shelterId: session.shelterId } }
      : session.role === "ADMIN"
        ? {}
        : { pet: { postedById: session.userId } }

  const where: Record<string, unknown> = {
    ...petOwnershipWhere,
    deletedAt: null,
    status: filters.status
      ? filters.status
      : { not: "DRAFT" as AdoptionStatus },
  }

  if (filters.petId) {
    where.petId = filters.petId
  }

  const skip = (page - 1) * limit

  const [total, records] = await Promise.all([
    prisma.adoptionApplication.count({ where }),
    prisma.adoptionApplication.findMany({
      where,
      select: {
        id: true,
        status: true,
        submittedAt: true,
        createdAt: true,
        applicant: {
          select: { firstName: true, lastName: true, avatar: true },
        },
        pet: {
          select: {
            id: true,
            name: true,
            petImages: {
              where: { isPrimary: true },
              take: 1,
              select: { url: true },
            },
            postedBy: {
              select: { firstName: true, lastName: true },
            },
            shelter: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      skip,
      take: limit,
    }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return {
    applications: records.map((r) => ({
      id: r.id,
      status: r.status,
      submittedAt: r.submittedAt,
      createdAt: r.createdAt,
      applicant: r.applicant,
      pet: {
        id: r.pet.id,
        name: r.pet.name,
        primaryImageUrl: r.pet.petImages[0]?.url ?? null,
        postedBy: r.pet.postedBy,
        shelter: r.pet.shelter,
      },
    })),
    total,
    page,
    pageSize: limit,
    totalPages,
  }
}

// -- Pet dropdown helper for filters --

export async function getPetsByOwner(
  session: PetOwnerSession
): Promise<{ id: string; name: string }[]> {
  const where =
    session.role === "SHELTER_STAFF" && session.shelterId
      ? { shelterId: session.shelterId }
      : session.role === "ADMIN"
        ? {}
        : { postedById: session.userId }

  return prisma.pet.findMany({
    where,
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })
}

// -- Full application detail for /applications/[id] --

export async function getApplicationDetail(id: string) {
  return prisma.adoptionApplication.findFirst({
    where: { id, deletedAt: null },
    include: {
      applicant: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          address: true,
          avatar: true,
          occupation: true,
          dateOfBirth: true,
        },
      },
      pet: {
        include: {
          petImages: {
            orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
          },
          shelter: true,
          postedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      documents: true,
      aiInsight: true,
      reviewedBy: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  })
}

