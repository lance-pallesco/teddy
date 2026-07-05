import { Suspense } from "react"
import Link from "next/link"
import { PawPrint, ClipboardList, FileHeart, CalendarRange, Plus, ArrowRight } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatsGridSkeleton } from "@/components/dashboard/DashboardSkeleton"
import { getShelterStaffStats } from "@/lib/services/dashboard.service"

type ShelterStaffDashboardProps = {
  shelterId: string
}

async function ShelterStaffStatsGrid({ shelterId }: { shelterId: string }) {
  const stats = await getShelterStaffStats(shelterId)

  return (
    <div className="space-y-6">
      {/* Dynamic Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{stats.shelterName}</h1>
            <Badge variant={stats.shelterActive ? "success" : "secondary"}>
              {stats.shelterActive ? "Active Shelter" : "Inactive"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">Shelter overview dashboard and actions.</p>
        </div>
      </div>

      {/* Quick Action Links */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="flex items-center justify-between p-6 border bg-gradient-to-br from-primary/5 via-background to-background hover:border-primary/30 transition-all shadow-xs">
          <div className="space-y-1">
            <h3 className="font-semibold">Add Pet</h3>
            <p className="text-sm text-muted-foreground">Post a new pet listing to make them available for adoption.</p>
          </div>
          <Button asChild size="sm" className="shrink-0 ml-4">
            <Link href="/pets/new">
              <Plus className="size-4 mr-1" />
              Add Pet
            </Link>
          </Button>
        </Card>

        <Card className="flex items-center justify-between p-6 border bg-gradient-to-br from-primary/5 via-background to-background hover:border-primary/30 transition-all shadow-xs">
          <div className="space-y-1">
            <h3 className="font-semibold">View Applications</h3>
            <p className="text-sm text-muted-foreground">Review incoming adoption requests and check candidate details.</p>
          </div>
          <Button asChild size="sm" variant="secondary" className="shrink-0 ml-4">
            <Link href="/applications">
              Review
              <ArrowRight className="size-4 ml-1" />
            </Link>
          </Button>
        </Card>
      </div>

      {/* Statistics */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Metrics & Activity</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Available Pets */}
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

          {/* Card 2: Pending Applications */}
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

          {/* Card 3: Total Adoptions */}
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

          {/* Card 4: Applications This Week */}
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
    </div>
  )
}

export function ShelterStaffDashboard({ shelterId }: ShelterStaffDashboardProps) {
  return (
    <Suspense fallback={<StatsGridSkeleton count={4} />}>
      <ShelterStaffStatsGrid shelterId={shelterId} />
    </Suspense>
  )
}
