import "server-only"

import { prisma } from "@/lib/prisma"
import { AdoptionStatus, type AdoptionStep } from "@prisma/client"

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

    // 2. Optimistic lock on Pet status (must be AVAILABLE)
    try {
      await tx.pet.update({
        where: {
          id: app.petId,
          status: "AVAILABLE",
        },
        data: {
          status: "PENDING",
        },
      })
    } catch {
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
