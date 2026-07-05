import Link from "next/link"
import { ArrowLeftIcon, PawPrintIcon, AlertCircleIcon } from "lucide-react"

import { requireRole } from "@/lib/auth/require-role"
import { getAdopterDrafts } from "@/lib/services/application.service"
import { Button } from "@/components/ui/button"
import { SetBreadcrumbLabel } from "@/components/dashboard/breadcrumb-context"

import { DraftsListClient } from "./drafts-list.client"

export default async function DraftApplicationsPage() {
  // Enforce Adopter role
  const user = await requireRole(["ADOPTER"])

  // Fetch all draft applications for this adopter
  const drafts = await getAdopterDrafts(user.id)

  // Format drafts to clean client objects
  const formattedDrafts = drafts.map((d) => {
    const primaryImg = d.pet.petImages[0]?.url ?? null
    return {
      id: d.id,
      petId: d.pet.id,
      petName: d.pet.name,
      petBreed: d.pet.breed ?? "Mixed breed",
      petSpecies: d.pet.species,
      petPhotoUrl: primaryImg,
      updatedAt: d.updatedAt.toISOString(),
      currentStep: d.currentStep,
    }
  })

  return (
    <div className="flex-1 p-4 md:p-6">
      <SetBreadcrumbLabel segment="draft" label="Draft Applications" />
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Draft Applications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Resume or discard your incomplete adoption applications.
          </p>
        </div>

        {formattedDrafts.length === 0 ? (
          <div className="flex min-h-60 flex-col items-center justify-center rounded-xl border border-dashed bg-muted/10 p-8 text-center">
            <AlertCircleIcon className="size-10 text-muted-foreground opacity-55" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">No draft applications</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              You don&apos;t have any incomplete adoption applications right now. Browse our available pets to find your match!
            </p>
            <Button asChild className="mt-4" size="sm">
              <Link href="/pets">
                <PawPrintIcon className="size-4 mr-2" />
                Browse Pets
              </Link>
            </Button>
          </div>
        ) : (
          <DraftsListClient initialDrafts={formattedDrafts} />
        )}
      </div>
    </div>
  )
}
