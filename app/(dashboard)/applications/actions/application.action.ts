"use server"

import { revalidatePath } from "next/cache"
import { mkdir, writeFile, unlink } from "fs/promises"
import path from "path"
import { randomUUID } from "crypto"

import { requireRole } from "@/lib/auth/require-role"
import { prisma } from "@/lib/prisma"
import {
  SaveDraftStepSchema,
  SubmitApplicationSchema,
} from "@/lib/validators/application.schema"
import {
  createDraftApplication,
  saveDraftStep,
  submitApplication,
  checkExistingApplication,
  deleteApplicationDraft,
} from "@/lib/services/application.service"
import { ApplicationDocumentType, GovernmentIDType } from "@prisma/client"
import { notificationService } from "@/lib/services/notification.service"

/**
 * Creates a new draft application or retrieves an existing one for the target pet.
 */
export async function getOrCreateDraftAction(petId: string) {
  // 1. Enforce Role
  const user = await requireRole(["ADOPTER"])

  try {
    // 2. Verify Pet exists and status is AVAILABLE
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
      select: { id: true, status: true },
    })

    if (!pet) {
      return { success: false, error: "Pet not found." }
    }

    if (pet.status !== "AVAILABLE") {
      return { success: false, error: "This pet is no longer available for adoption." }
    }

    // 3. Check for existing application
    const existing = await checkExistingApplication(petId, user.id)

    if (existing) {
      if (existing.status === "DRAFT") {
        return {
          success: true,
          applicationId: existing.id,
          currentStep: existing.currentStep, // resume
        }
      } else {
        return {
          success: false,
          error: "You have already submitted an application for this pet.",
          existingId: existing.id,
        }
      }
    }

    // 4. Create new DRAFT application
    const draft = await createDraftApplication(petId, user.id)

    revalidatePath("/applications/draft")
    return {
      success: true,
      applicationId: draft.id,
      currentStep: draft.currentStep,
    }
  } catch (err) {
    console.error("[getOrCreateDraftAction]", err)
    return { success: false, error: "Something went wrong. Please try again." }
  }
}


export async function saveApplicationStepAction(rawInput: unknown) {

  const user = await requireRole(["ADOPTER"])
  const parsed = SaveDraftStepSchema.safeParse(rawInput)

  if (!parsed.success) {
    return { success: false, error: "Invalid form input." }
  }

  const { applicationId, step, data } = parsed.data

  try {
    // 3. Ownership and status verification
    const app = await prisma.adoptionApplication.findUnique({
      where: { id: applicationId },
      select: { applicantId: true, status: true, petId: true },
    })

    if (!app) {
      return { success: false, error: "Application draft not found." }
    }

    if (app.applicantId !== user.id) {
      return { success: false, error: "Unauthorized access." }
    }

    if (app.status !== "DRAFT") {
      return { success: false, error: "Cannot edit a submitted application." }
    }

    // 4. Save step data via service
    await saveDraftStep(applicationId, step, data)

    revalidatePath(`/pets/${app.petId}/apply`)
    revalidatePath("/applications/draft")
    return { success: true }
  } catch (err) {
    console.error("[saveApplicationStepAction]", err)
    return { success: false, error: "Failed to save draft progress." }
  }
}

export async function uploadApplicationDocumentAction(formData: FormData) {

  const user = await requireRole(["ADOPTER"])
  const file = formData.get("file")
  const applicationId = formData.get("applicationId") as string
  const type = formData.get("type") as ApplicationDocumentType
  const idType = formData.get("idType") as GovernmentIDType

  if (!applicationId || !type) {
    return { success: false, error: "Missing required parameters." }
  }

  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "No file provided." }
  }

  const app = await prisma.adoptionApplication.findUnique({
    where: { id: applicationId },
    select: { applicantId: true, status: true, petId: true },
  })

  if (!app || app.applicantId !== user.id || app.status !== "DRAFT") {
    return { success: false, error: "Unauthorized or application is not a draft." }
  }

  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"]
  if (!allowedTypes.includes(file.type)) {
    return { success: false, error: "Invalid file type. Only JPG, PNG, and PDF are allowed." }
  }

  const maxBytes = 5 * 1024 * 1024
  if (file.size > maxBytes) {
    return { success: false, error: "File size exceeds the 5MB limit." }
  }

  try {
    const ext = file.type === "application/pdf" ? ".pdf" : file.type === "image/png" ? ".png" : ".jpg"
    const filename = `${randomUUID()}${ext}`
    const uploadDir = path.join(process.cwd(), "public/uploads/documents")

    await mkdir(uploadDir, { recursive: true })
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(path.join(uploadDir, filename), buffer)

    const url = `/uploads/documents/${filename}`

    const document = await prisma.applicationDocument.create({
      data: {
        applicationId,
        type,
        idType: type === "GOVERNMENT_ID" ? idType : "DRIVER_LICENSE", // default non-null enum
        name: file.name,
        url,
      },
    })

    revalidatePath(`/pets/${app.petId}/apply`)
    return { success: true, document }
  } catch (err) {
    console.error("[uploadApplicationDocumentAction]", err)
    return { success: false, error: "Failed to upload document. Please try again." }
  }
}

export async function uploadSignatureAction(formData: FormData) {
  const user = await requireRole(["ADOPTER"])

  const applicationId = formData.get("applicationId") as string
  const signatureBase64 = formData.get("signatureBase64") as string

  if (!applicationId || !signatureBase64) {
    return { success: false, error: "Missing required parameters." }
  }

  const app = await prisma.adoptionApplication.findUnique({
    where: { id: applicationId },
    select: { applicantId: true, status: true, petId: true },
  })

  if (!app || app.applicantId !== user.id || app.status !== "DRAFT") {
    return { success: false, error: "Unauthorized or application is not a draft." }
  }

  try {
    const base64Data = signatureBase64.replace(/^data:image\/\w+;base64,/, "")
    const buffer = Buffer.from(base64Data, "base64")
    const filename = `${randomUUID()}.png`
    const uploadDir = path.join(process.cwd(), "public/uploads/documents")

    await mkdir(uploadDir, { recursive: true })
    await writeFile(path.join(uploadDir, filename), buffer)

    const url = `/uploads/documents/${filename}`

    // 5. DB transactional write
    await prisma.$transaction(async (tx) => {
      // Remove any existing signature documents
      await tx.applicationDocument.deleteMany({
        where: {
          applicationId,
          type: "SIGNATURE",
        },
      })

      // Create signature document record
      await tx.applicationDocument.create({
        data: {
          applicationId,
          type: "SIGNATURE",
          idType: "DRIVER_LICENSE", // default non-null enum
          name: "digital-signature.png",
          url,
        },
      })

      // Update signature URL
      await tx.adoptionApplication.update({
        where: { id: applicationId },
        data: { signatureUrl: url },
      })
    })

    revalidatePath(`/pets/${app.petId}/apply`)
    return { success: true, url }
  } catch (err) {
    console.error("[uploadSignatureAction]", err)
    return { success: false, error: "Failed to save digital signature." }
  }
}

/**
 * Deletes an uploaded document.
 */
export async function deleteDocumentAction(documentId: string) {
  // 1. Enforce Role
  const user = await requireRole(["ADOPTER"])

  try {
    // 2. Fetch document & check ownership
    const doc = await prisma.applicationDocument.findUnique({
      where: { id: documentId },
      include: { application: true },
    })

    if (!doc) {
      return { success: false, error: "Document not found." }
    }

    if (doc.application.applicantId !== user.id || doc.application.status !== "DRAFT") {
      return { success: false, error: "Unauthorized." }
    }

    // 3. Delete from DB
    await prisma.applicationDocument.delete({
      where: { id: documentId },
    })

    // 4. Remove file from disk
    const filePath = path.join(process.cwd(), "public", doc.url)
    try {
      await unlink(filePath)
    } catch {
      // Ignore if file doesn't exist
    }

    revalidatePath(`/pets/${doc.application.petId}/apply`)
    return { success: true }
  } catch (err) {
    console.error("[deleteDocumentAction]", err)
    return { success: false, error: "Failed to delete document." }
  }
}

/**
 * Validates JSON structures, file requirements, agreements, and submits the application.
 */
export async function submitApplicationAction(applicationId: string) {
  // 1. Enforce Role
  const user = await requireRole(["ADOPTER"])

  try {
    // 2. Fetch application
    const app = await prisma.adoptionApplication.findUnique({
      where: { id: applicationId },
      include: { documents: true, pet: true },
    })

    if (!app) {
      return { success: false, error: "Application not found." }
    }

    if (app.applicantId !== user.id) {
      return { success: false, error: "Unauthorized access." }
    }

    if (app.status !== "DRAFT") {
      return { success: false, error: "Application is already submitted." }
    }

    // 3. Validate JSON schemas combined
    const dataToValidate = {
      livingEnvironment: app.livingEnvironment,
      householdLifestyle: app.householdLifestyle,
      petExperience: app.petExperience,
      adoptionCommitment: app.adoptionCommitment,
      agreements: app.agreements,
    }

    const parsed = SubmitApplicationSchema.safeParse(dataToValidate)
    if (!parsed.success) {
      const errorMsg = parsed.error.issues
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join("; ")
      return {
        success: false,
        error: `Please complete all required fields before submitting: ${errorMsg}`,
      }
    }

    // 4. Verify required documents exist
    const hasGovId = app.documents.some((d) => d.type === "GOVERNMENT_ID")
    const hasProof = app.documents.some((d) => d.type === "PROOF_OF_ADDRESS")
    const hasSig = app.documents.some((d) => d.type === "SIGNATURE")

    if (!hasGovId) {
      return { success: false, error: "Please upload your Government Issued ID." }
    }
    if (!hasProof) {
      return { success: false, error: "Please upload your Proof of Address." }
    }
    if (!hasSig) {
      return { success: false, error: "Digital signature is required." }
    }

    // 5. Submit application transaction
    await submitApplication(applicationId, user.id)

    // Trigger notification to shelter/rescuer + Admins
    const recipientIds: string[] = []
    if (app.pet.shelterId) {
      const staff = await prisma.user.findMany({
        where: { shelterId: app.pet.shelterId, role: "SHELTER_STAFF", isActive: true },
        select: { id: true },
      })
      recipientIds.push(...staff.map((s) => s.id))
    }
    if (app.pet.postedById) {
      recipientIds.push(app.pet.postedById)
    }

    const adopterName = `${user.firstName} ${user.lastName}`
    await notificationService.notifyMultipleUsers(
      recipientIds,
      "New Application Received",
      `New adoption application received for ${app.pet.name} from ${adopterName}.`,
      "APPLICATION",
      `/applications/${applicationId}`
    )

    revalidatePath(`/pets/${app.petId}/apply`)
    revalidatePath("/applications/draft")
    revalidatePath("/applications")
    return { success: true, applicationId }
  } catch (err) {
    console.error("[submitApplicationAction]", err)
    const errorMsg = err instanceof Error ? err.message : "Something went wrong."
    return { success: false, error: errorMsg }
  }
}

/**
 * Discards/Deletes a draft application.
 */
export async function discardDraftAction(applicationId: string) {
  // 1. Enforce Role
  const user = await requireRole(["ADOPTER"])

  try {
    await deleteApplicationDraft(applicationId, user.id)
    revalidatePath("/applications")
    revalidatePath("/applications/draft")
    revalidatePath("/")
    return { success: true }
  } catch (err) {
    console.error("[discardDraftAction]", err)
    return { success: false, error: "Failed to discard application draft." }
  }
}

/**
 * Withdraws a submitted (PENDING) application, setting status to WITHDRAWN and soft-deleting it.
 */
export async function withdrawApplicationAction(applicationId: string) {
  // 1. Enforce Role
  const user = await requireRole(["ADOPTER"])

  try {
    // 2. Fetch application and verify ownership and status
    const app = await prisma.adoptionApplication.findUnique({
      where: { id: applicationId },
      include: { pet: true },
    })

    if (!app) {
      return { success: false, error: "Application not found." }
    }

    if (app.applicantId !== user.id) {
      return { success: false, error: "Unauthorized access." }
    }

    if (app.status !== "PENDING" && app.status !== "DRAFT") {
      return { success: false, error: "Only draft or pending applications can be withdrawn." }
    }

    // 3. Update application: status is WITHDRAWN, deletedAt is set
    await prisma.adoptionApplication.update({
      where: { id: applicationId },
      data: {
        status: "WITHDRAWN",
        deletedAt: new Date(),
      },
    })

    // 4. Trigger notifications if application was submitted
    if (app.status === "PENDING") {
      const recipientIds: string[] = []
      if (app.pet.shelterId) {
        const staff = await prisma.user.findMany({
          where: { shelterId: app.pet.shelterId, role: "SHELTER_STAFF", isActive: true },
          select: { id: true },
        })
        recipientIds.push(...staff.map((s) => s.id))
      }
      if (app.pet.postedById) {
        recipientIds.push(app.pet.postedById)
      }

      const adopterName = `${user.firstName} ${user.lastName}`
      await notificationService.notifyMultipleUsers(
        recipientIds,
        "Application Withdrawn",
        `${adopterName} has withdrawn their adoption application for ${app.pet.name}.`,
        "APPLICATION",
        `/applications/${applicationId}`
      )
    }

    revalidatePath(`/applications/${applicationId}`)
    revalidatePath("/applications")
    return { success: true }
  } catch (err) {
    console.error("[withdrawApplicationAction]", err)
    return { success: false, error: "Failed to withdraw application. Please try again." }
  }
}
