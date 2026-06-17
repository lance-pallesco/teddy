import { notFound, redirect } from "next/navigation"
import { ArrowLeftIcon, AlertCircleIcon } from "lucide-react"
import Link from "next/link"

import { requireRole } from "@/lib/auth/require-role"
import { getPetById } from "@/lib/services/pet.service"
import {
  checkExistingApplication,
  createDraftApplication,
  getApplicationById,
} from "@/lib/services/application.service"
import { prisma } from "@/lib/prisma"

import { PetSummaryCard } from "@/components/applications/PetSummaryCard"
import { ApplicationWizard } from "@/components/applications/ApplicationWizard"
import { Button } from "@/components/ui/button"

interface ApplyPageProps {
  params: Promise<{ id: string }>
}

export default async function ApplyPage({ params }: ApplyPageProps) {
  // 1. Enforce authenticated ADOPTER role
  const user = await requireRole(["ADOPTER"])
  const { id: petId } = await params

  // 2. Fetch pet details
  const pet = await getPetById(petId)
  if (!pet) {
    notFound()
  }

  // 3. Verify pet status is AVAILABLE
  if (pet.status !== "AVAILABLE") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4 rounded-xl border border-destructive/20 bg-destructive/5 p-8 shadow-xs">
          <AlertCircleIcon className="mx-auto size-12 text-destructive" />
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Pet No Longer Available
          </h2>
          <p className="text-sm text-muted-foreground">
            We are sorry, but <strong>{pet.name}</strong> is no longer available for adoption.
          </p>
          <Button asChild className="w-full">
            <Link href="/pets">
              <ArrowLeftIcon className="size-4 mr-2" />
              Back to listings
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  // 4. Check for existing applications (any status)
  const existingApp = await checkExistingApplication(pet.id, user.id)
  if (existingApp && existingApp.status !== "DRAFT") {
    // Redirect to applications with a toast trigger parameter
    redirect(`/applications?error=duplicate&name=${encodeURIComponent(pet.name)}`)
  }

  // 5. Get or Create draft application
  let draftId = existingApp?.id
  if (!draftId) {
    const newDraft = await createDraftApplication(pet.id, user.id)
    draftId = newDraft.id
  }

  // Fetch full draft with relations
  const application = await getApplicationById(draftId)
  if (!application) {
    notFound()
  }

  // 6. Fetch full user details for pre-filling Step 1
  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      address: true,
      occupation: true,
      dateOfBirth: true,
    },
  })

  if (!fullUser) {
    redirect("/login")
  }

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        {/* Back navigation */}
        <Button variant="ghost" size="sm" className="-ml-2 w-fit text-muted-foreground hover:text-foreground" asChild>
          <Link href={`/pets/${pet.id}`}>
            <ArrowLeftIcon className="size-4 mr-2" />
            Back to {pet.name}&apos;s Details
          </Link>
        </Button>

        {/* Form Layout: 2 Columns on large screens, 1 on mobile */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Pet Summary Card Column */}
          <div className="lg:col-span-1">
            <PetSummaryCard pet={pet} />
          </div>

          {/* Form Wizard Column */}
          <div className="lg:col-span-2">
            <ApplicationWizard
              pet={pet}
              application={application}
              userProfile={fullUser}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
