import {
  ClipboardListIcon,
  HeartHandshakeIcon,
  PawPrintIcon,
  UsersIcon,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

type ShelterStats = {
  totalPets: number
  totalApplications: number
  totalAdoptions: number
  shelterStaffCount: number
}

type ShelterStatsRowProps = {
  stats: ShelterStats
}

export function ShelterStatsRow({ stats }: ShelterStatsRowProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="flex items-start justify-between p-5">
          <div>
            <p className="text-sm text-muted-foreground">Total Pets</p>
            <p className="mt-1 text-2xl font-semibold">{stats.totalPets}</p>
          </div>
          <PawPrintIcon className="size-5 text-muted-foreground" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-start justify-between p-5">
          <div>
            <p className="text-sm text-muted-foreground">
              Total Applications
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {stats.totalApplications}
            </p>
          </div>
          <ClipboardListIcon className="size-5 text-muted-foreground" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-start justify-between p-5">
          <div>
            <p className="text-sm text-muted-foreground">Total Adoptions</p>
            <p className="mt-1 text-2xl font-semibold">{stats.totalAdoptions}</p>
          </div>
          <HeartHandshakeIcon className="size-5 text-muted-foreground" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-start justify-between p-5">
          <div>
            <p className="text-sm text-muted-foreground">
              Shelter Staff Count
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {stats.shelterStaffCount}
            </p>
          </div>
          <UsersIcon className="size-5 text-muted-foreground" />
        </CardContent>
      </Card>
    </div>
  )
}

