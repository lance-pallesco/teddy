import { redirect } from "next/navigation"

import { getCurrentUser } from "@/lib/auth/session"
import { SuperAdminDashboard } from "@/components/dashboard/super-admin-dashboard"
import { ShelterStaffDashboard } from "@/components/dashboard/shelter-staff-dashboard"
import { PetOwnerDashboard } from "@/components/dashboard/pet-owner-dashboard"
import { AdopterDashboard } from "@/components/dashboard/adopter-dashboard"

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const role = user.role

  return (
    <div className="flex w-full flex-1 flex-col p-4 md:p-6 lg:p-8">
      <div className="mx-auto w-full max-w-7xl">
        {role === "ADMIN" ? (
          <SuperAdminDashboard />
        ) : role === "SHELTER_STAFF" ? (
          <ShelterStaffDashboard shelterId={user.shelterId ?? ""} />
        ) : role === "PET_OWNER" ? (
          <PetOwnerDashboard userId={user.id} />
        ) : role === "ADOPTER" ? (
          <AdopterDashboard userId={user.id} />
        ) : (
          redirect("/unauthorized")
        )}
      </div>
    </div>
  )
}
