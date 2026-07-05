import { Suspense } from "react"
import Link from "next/link"
import { PawPrint, ClipboardList, FileHeart, CalendarRange, Plus, ArrowRight } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatsGridSkeleton } from "@/components/dashboard/DashboardSkeleton"
import { getPetOwnerStats } from "@/lib/services/dashboard.service"

type PetOwnerDashboardProps = {
  userId: string
}

async function PetOwnerStatsGrid({ userId }: { userId: string }) {
  const stats = await getPetOwnerStats(userId)

  return (
    <div className="space-y-6">
      {/* Quick Action Links */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="flex items-center justify-between p-6 border bg-gradient-to-br from-primary/5 via-background to-background hover:border-primary/30 transition-all shadow-xs">
          <div className="space-y-1">
            <h3 className="font-semibold">Post a Pet</h3>
            <p className="text-sm text-muted-foreground">List a pet for adoption under your individual foster care.</p>
          </div>
          <Button asChild size="sm" className="shrink-0 ml-4">
            <Link href="/pets/new">
              <Plus className="size-4 mr-1" />
              Post Pet
            </Link>
          </Button>
        </Card>

        <Card className="flex items-center justify-between p-6 border bg-gradient-to-br from-primary/5 via-background to-background hover:border-primary/30 transition-all shadow-xs">
          <div className="space-y-1">
            <h3 className="font-semibold">View Applications</h3>
            <p className="text-sm text-muted-foreground">Review adoption requests submitted by potential adopters for your pets.</p>
          </div>
          <Button asChild size="sm" variant="secondary" className="shrink-0 ml-4">
            <Link href="/applications">
              Applications
              <ArrowRight className="size-4 ml-1" />
            </Link>
          </Button>
        </Card>
      </div>

      {/* Statistics */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Fostering & Adoptions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Available Pets */}
          <Card className="shadow-xs border border-primary/10 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Available Pets</CardTitle>
              <PawPrint className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.pets.AVAILABLE}</div>
              <p className="text-xs text-muted-foreground mt-1">Fosters currently available for adoption</p>
            </CardContent>
          </Card>

          {/* Card 2: Pending Fosters */}
          <Card className="shadow-xs border border-primary/10 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Fosters</CardTitle>
              <ClipboardList className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.pets.PENDING}</div>
              <p className="text-xs text-muted-foreground mt-1">Pets in evaluation / processing stage</p>
            </CardContent>
          </Card>

          {/* Card 3: Adopted Fosters */}
          <Card className="shadow-xs border border-primary/10 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Adopted Fosters</CardTitle>
              <FileHeart className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.pets.ADOPTED}</div>
              <p className="text-xs text-muted-foreground mt-1">Successfully adopted pets</p>
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
              <p className="text-xs text-muted-foreground mt-1">Applications received in last 7 days</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export function PetOwnerDashboard({ userId }: PetOwnerDashboardProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Individual foster management and adoption requests."
      />

      <Suspense fallback={<StatsGridSkeleton count={4} />}>
        <PetOwnerStatsGrid userId={userId} />
      </Suspense>
    </div>
  )
}
