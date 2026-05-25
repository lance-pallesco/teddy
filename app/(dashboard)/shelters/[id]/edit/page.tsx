import { notFound } from "next/navigation"

import { ShelterForm } from "@/components/shelters/shelter-form"
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
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit Shelter</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update {shelter.name}&apos;s profile, location, and contact details.
        </p>
      </div>
      <ShelterForm mode="edit" initialData={shelter} />
    </div>
  )
}
