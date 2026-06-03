import { notFound } from "next/navigation"

import { ShelterTabs } from "@/components/shelters/shelter-tabs"
import { ShelterInfoCard } from "@/components/shelters/shelter-info-card"
import { ShelterStatsRow } from "@/components/shelters/shelter-stats-row"
import { ShelterStatusActions } from "@/components/shelters/shelter-status-actions"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ShelterPetsGrid } from "@/components/shelters/shelter-pets-grid"
import { getShelterById } from "@/lib/services/shelter.service"
import { getShelterPets } from "@/lib/services/pet.service"
import { listShelterStaff } from "@/lib/services/user.service"
import { requireRole } from "@/lib/auth/require-role"

type ShelterDetailPageProps = {
  params: Promise<{ id: string }>
}

export default async function ShelterDetailPage({
  params,
}: ShelterDetailPageProps) {
  await requireRole(["ADMIN"])

  const { id } = await params
  const shelter = await getShelterById(id)

  if (!shelter) {
    notFound()
  }

  const staffMembers = await listShelterStaff({ shelterId: id })
  const shelterPets = await getShelterPets(id, 1, 1)

  const mockStats = {
    totalPets: shelterPets.total,
    totalApplications: 0,
    totalAdoptions: 0,
    shelterStaffCount: staffMembers.length,
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {shelter.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Management overview for shelter operations.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <Button asChild variant="outline">
            {/* edit is handled by the already-existing edit route */}
            <a href={`/shelters/${shelter.id}/edit`}>Edit shelter</a>
          </Button>
          <ShelterStatusActions shelterId={shelter.id} isActive={shelter.isActive} />
        </div>
      </div>

      <ShelterInfoCard shelter={shelter} />
      <ShelterStatsRow stats={mockStats} />

      <div className="rounded-lg border p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-medium">Shelter workspace</h2>
          <div className="hidden sm:block">
            <p className="text-sm text-muted-foreground">Tabs are ready for future MVPs</p>
          </div>
        </div>
        <Separator className="my-4" />
        <ShelterTabs
          shelter={shelter}
          staffMembers={staffMembers}
          petsPanel={<ShelterPetsGrid shelterId={id} />}
        />
      </div>
    </div>
  )
}

