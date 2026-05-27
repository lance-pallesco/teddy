import { ShelterStaffForm } from "@/components/staff/shelter-staff-form"
import { requireRole } from "@/lib/auth/require-role"
import { listActiveShelterOptions } from "@/lib/services/shelter.service"

export default async function NewShelterStaffPage() {
  await requireRole(["ADMIN"])

  const shelters = await listActiveShelterOptions()

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add Shelter Staff</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create an operational staff account and assign it to an active shelter.
        </p>
      </div>
      <ShelterStaffForm shelters={shelters} />
    </div>
  )
}

