import { Suspense } from "react"
import { PawPrint, ClipboardList, FileHeart, CalendarRange } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatsGridSkeleton } from "@/components/dashboard/DashboardSkeleton"
import { getShelterStaffStats } from "@/lib/services/dashboard.service"
import { TeddyBanner } from "@/components/dashboard/teddy-banner"
import { getShelterAnalyticsData } from "@/lib/services/analytics.service"
import { ShelterAnalyticsCharts } from "@/components/analytics/shelter-analytics-charts"

type ShelterStaffDashboardProps = {
  userId: string
  shelterId: string
}

async function ShelterStaffStatsGrid({ shelterId }: { shelterId: string }) {
  const stats = await getShelterStaffStats(shelterId)
  const analyticsData = await getShelterAnalyticsData(shelterId)

  return (
    <div className="space-y-6">
      {/* Dynamic Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-[#3D3C3A]">{stats.shelterName}</h1>
            <Badge variant={stats.shelterActive ? "success" : "secondary"}>
              {stats.shelterActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5 font-light">Shelter overview dashboard and actions.</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-xs border border-primary/10 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Available Pets</CardTitle>
              <PawPrint className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.availablePets}</div>
              <p className="text-xs text-muted-foreground mt-1">Pets currently looking for a home</p>
            </CardContent>
          </Card>

          <Card className="shadow-xs border border-primary/10 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Applications</CardTitle>
              <ClipboardList className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.pendingApps}</div>
              <p className="text-xs text-muted-foreground mt-1">Applications waiting for review</p>
            </CardContent>
          </Card>

          <Card className="shadow-xs border border-primary/10 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Adoptions</CardTitle>
              <FileHeart className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalAdoptions}</div>
              <p className="text-xs text-muted-foreground mt-1">Approved applications to date</p>
            </CardContent>
          </Card>

          <Card className="shadow-xs border border-primary/10 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Weekly Applications</CardTitle>
              <CalendarRange className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.appsThisWeek}</div>
              <p className="text-xs text-muted-foreground mt-1">Incoming requests in the last 7 days</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Shelter Charts Section */}
      <ShelterAnalyticsCharts data={analyticsData} />
    </div>
  )
}

export function ShelterStaffDashboard({ userId, shelterId }: ShelterStaffDashboardProps) {
  return (
    <div className="space-y-8">
      {/* Welcome Mascot Banner */}
      <Suspense fallback={<div className="h-44 w-full rounded-2xl bg-[#F5EBE0]/30 border border-[#EADBC8]/40 animate-pulse" />}>
        <TeddyBanner userId={userId} />
      </Suspense>

      <Suspense fallback={<StatsGridSkeleton count={4} />}>
        <ShelterStaffStatsGrid shelterId={shelterId} />
      </Suspense>
    </div>
  )
}
