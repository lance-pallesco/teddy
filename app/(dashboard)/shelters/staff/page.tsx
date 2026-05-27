import { ShelterStaffTable } from "@/components/shelters/shelter-staff-table"
import { requireRole } from "@/lib/auth/require-role"
import { listShelterStaff } from "@/lib/services/user.service"

export default async function ShelterStaffManagementPage() {
  await requireRole(["ADMIN"])

  const staffMembers = await listShelterStaff()

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Shelter Staff</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage all shelter staff accounts across active and inactive shelters.
        </p>
      </div>
      <ShelterStaffTable staffMembers={staffMembers} showShelterColumn />
    </div>
  )
}
