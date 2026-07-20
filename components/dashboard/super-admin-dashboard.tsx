import { Suspense } from "react"
import Link from "next/link"
import { Building2, Users, PawPrint, ClipboardList, ArrowRight } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatsCardSkeleton } from "@/components/dashboard/DashboardSkeleton"
import { TeddyBanner } from "@/components/dashboard/teddy-banner"
import {
  getShelterStats,
  getUserStats,
  getPetStats,
  getMonthlyApplicationStats,
} from "@/lib/services/dashboard.service"
import { getAnalyticsData } from "@/lib/services/analytics.service"
import { AnalyticsCharts } from "@/components/analytics/analytics-charts"

// ---------- Async Stat Card Components ----------

async function ShelterStatsCard() {
  const stats = await getShelterStats()
  return (
    <Card className="shadow-xs border border-primary/10 hover:shadow-md transition-shadow bg-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Total Shelters</CardTitle>
        <Building2 className="size-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{stats.total}</div>
        <p className="text-xs text-muted-foreground mt-1">
          {stats.active} Active • {stats.inactive} Inactive
        </p>
      </CardContent>
    </Card>
  )
}

async function UserStatsCard() {
  const users = await getUserStats()
  const total = Object.values(users).reduce((a, b) => a + b, 0)
  return (
    <Card className="shadow-xs border border-primary/10 hover:shadow-md transition-shadow bg-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
        <Users className="size-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{total}</div>
        <p className="text-xs text-muted-foreground mt-1 truncate">
          {users.ADOPTER} Adopters • {users.SHELTER_STAFF} Staff • {users.PET_OWNER} Owners
        </p>
      </CardContent>
    </Card>
  )
}

async function PetStatsCard() {
  const pets = await getPetStats()
  const total = Object.values(pets).reduce((a, b) => a + b, 0)
  return (
    <Card className="shadow-xs border border-primary/10 hover:shadow-md transition-shadow bg-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Total Pets</CardTitle>
        <PawPrint className="size-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{total}</div>
        <p className="text-xs text-muted-foreground mt-1">
          {pets.AVAILABLE} Available • {pets.PENDING} Pending • {pets.ADOPTED} Adopted
        </p>
      </CardContent>
    </Card>
  )
}

async function ApplicationStatsCard() {
  const count = await getMonthlyApplicationStats()
  return (
    <Card className="shadow-xs border border-primary/10 hover:shadow-md transition-shadow bg-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Applications This Month</CardTitle>
        <ClipboardList className="size-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{count}</div>
        <p className="text-xs text-muted-foreground mt-1">
          Submitted requests this calendar month
        </p>
      </CardContent>
    </Card>
  )
}

export async function SuperAdminDashboard({ userId }: { userId: string }) {
  const analyticsData = await getAnalyticsData()

  return (
    <div className="space-y-6">
      {/* Welcome Mascot Banner */}
      <Suspense fallback={<div className="h-44 w-full rounded-2xl bg-[#F5EBE0]/30 border border-[#EADBC8]/40 animate-pulse" />}>
        <TeddyBanner userId={userId} />
      </Suspense>

      {/* Quick Action Links
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="flex items-center justify-between p-6 border bg-white">
          <div className="space-y-1">
            <h3 className="font-semibold">Manage Shelters</h3>
            <p className="text-sm text-muted-foreground">Review registered shelters, verify accounts, and add staff members.</p>
          </div>
          <Button asChild size="sm" variant="secondary" className="shrink-0 ml-4">
            <Link href="/shelters">
              Go
              <ArrowRight className="size-4 ml-1" />
            </Link>
          </Button>
        </Card>

        <Card className="flex items-center justify-between p-6 border bg-white">
          <div className="space-y-1">
            <h3 className="font-semibold">Manage Users</h3>
            <p className="text-sm text-muted-foreground">View and modify system users, roles, account statuses, and profiles.</p>
          </div>
          <Button asChild size="sm" variant="secondary" className="shrink-0 ml-4">
            <Link href="/users">
              Go
              <ArrowRight className="size-4 ml-1" />
            </Link>
          </Button>
        </Card>
      </div> */}

      {/* Statistics Section */}
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Suspense fallback={<StatsCardSkeleton />}>
            <ShelterStatsCard />
          </Suspense>
          <Suspense fallback={<StatsCardSkeleton />}>
            <UserStatsCard />
          </Suspense>
          <Suspense fallback={<StatsCardSkeleton />}>
            <PetStatsCard />
          </Suspense>
          <Suspense fallback={<StatsCardSkeleton />}>
            <ApplicationStatsCard />
          </Suspense>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#3D3C3A] dark:text-white">Platform Performance Trends</h2>
        <AnalyticsCharts data={analyticsData} />
      </div>
    </div>
  )
}
