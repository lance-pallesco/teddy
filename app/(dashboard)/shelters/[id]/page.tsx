import { notFound } from "next/navigation"

import { ShelterTabs } from "@/components/shelters/shelter-tabs"
import { ShelterInfoCard } from "@/components/shelters/shelter-info-card"
import { ShelterStatsRow } from "@/components/shelters/shelter-stats-row"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { getShelterById } from "@/lib/services/shelter.service"
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

  const mockStats = {
    totalPets: 0,
    totalApplications: 0,
    totalAdoptions: 0,
    shelterStaffCount: 0,
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

        <Button asChild variant="outline">
          {/* edit is handled by the already-existing edit route */}
          <a href={`/shelters/${shelter.id}/edit`}>Edit shelter</a>
        </Button>
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
        <ShelterTabs shelter={shelter} />
      </div>
    </div>
  )
}

