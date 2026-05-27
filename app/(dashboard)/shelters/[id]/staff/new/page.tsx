import { notFound } from "next/navigation"

import { ShelterStaffForm } from "@/components/staff/shelter-staff-form"
import { requireRole } from "@/lib/auth/require-role"
import { getShelterById, listActiveShelterOptions } from "@/lib/services/shelter.service"

type NewShelterStaffForShelterPageProps = {
  params: Promise<{ id: string }>
}

export default async function NewShelterStaffForShelterPage({
  params,
}: NewShelterStaffForShelterPageProps) {
  await requireRole(["ADMIN"])

  const { id } = await params
  const shelter = await getShelterById(id)

  if (!shelter) {
    notFound()
  }

  const shelters = await listActiveShelterOptions()
  const shelterOptions = shelters.some((item) => item.id === shelter.id)
    ? shelters
    : [{ id: shelter.id, name: shelter.name }, ...shelters]

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add Staff</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a staff account for <span className="font-medium">{shelter.name}</span>.
        </p>
      </div>
      <ShelterStaffForm shelters={shelterOptions} preselectedShelterId={shelter.id} />
    </div>
  )
}

