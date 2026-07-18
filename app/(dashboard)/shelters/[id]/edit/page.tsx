import { notFound } from "next/navigation"

import { EditShelterForm } from "@/components/shelters/edit-shelter-form"
import { SetBreadcrumbLabel } from "@/components/dashboard/breadcrumb-context"
import { requireRole } from "@/lib/auth/require-role"
import { getShelterById } from "@/lib/services/shelter.service"

type EditShelterPageProps = {
  params: Promise<{ id: string }>
}

export default async function EditShelterPage({ params }: EditShelterPageProps) {
  await requireRole(["ADMIN"])

  const { id } = await params
  const shelter = await getShelterById(id)

  if (!shelter) {
    notFound()
  }

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <SetBreadcrumbLabel segment={id} label={shelter.name} />
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#3D3C3A]">
            Edit Shelter
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Update {shelter.name}&apos;s profile, contact details, and logo.
          </p>
        </div>

        <EditShelterForm shelter={shelter} />
      </div>
    </div>
  )
}
