import { Suspense } from "react"
import Link from "next/link"
import { ClipboardList, FileHeart, CalendarRange, ArrowRight, Search, HeartHandshake } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatsGridSkeleton, RecentPetsSkeleton } from "@/components/dashboard/DashboardSkeleton"
import { PetCard } from "@/components/pets/pet-card"
import { getAdopterStats } from "@/lib/services/dashboard.service"
import { getPets } from "@/lib/services/pet.service"

type AdopterDashboardProps = {
  userId: string
}

async function AdopterStatsGrid({ userId }: { userId: string }) {
  const stats = await getAdopterStats(userId)

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {/* Card 1: Active Applications */}
      <Card className="shadow-xs border border-primary/10 hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Active Applications</CardTitle>
          <ClipboardList className="size-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.applications.PENDING}</div>
          <p className="text-xs text-muted-foreground mt-1">Applications currently pending review</p>
        </CardContent>
      </Card>

      {/* Card 2: Under Review */}
      <Card className="shadow-xs border border-primary/10 hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Under Review</CardTitle>
          <FileHeart className="size-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.applications.UNDER_REVIEW}</div>
          <p className="text-xs text-muted-foreground mt-1">Applications being actively evaluated</p>
        </CardContent>
      </Card>

      {/* Card 3: Interview Scheduled */}
      <Card className="shadow-xs border border-primary/10 hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Interviews Scheduled</CardTitle>
          <CalendarRange className="size-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.interviewsScheduled}</div>
          <p className="text-xs text-muted-foreground mt-1">Scheduled meet & greets or discussions</p>
        </CardContent>
      </Card>
    </div>
  )
}

async function RecentPetsGrid({ userId }: { userId: string }) {
  const result = await getPets(
    { userId, role: "ADOPTER", shelterId: null },
    { tab: "active" },
    1,
    3
  )

  const recentPets = result.pets

  if (recentPets.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground text-sm">
        No available pets listed recently.
      </div>
    )
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {recentPets.map((pet) => (
        <PetCard key={pet.id} pet={pet} />
      ))}
    </div>
  )
}

export function AdopterDashboard({ userId }: AdopterDashboardProps) {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        subtitle="Track your applications and explore available pets."
      />

      {/* Statistics */}
      <Suspense fallback={<StatsGridSkeleton count={3} />}>
        <AdopterStatsGrid userId={userId} />
      </Suspense>

      {/* Browse Pets CTA Card */}
      <Card className="overflow-hidden border border-primary/10 shadow-sm bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <HeartHandshake className="size-3.5" />
              Adopt, Don't Shop
            </div>
            <h3 className="text-2xl font-bold tracking-tight">Find Your Perfect Companion</h3>
            <p className="text-muted-foreground text-sm md:text-base">
              Hundreds of lovable dogs, cats, rabbits, and birds are waiting in shelters and foster homes for a second chance. Start searching today.
            </p>
          </div>
          <Button asChild size="lg" className="shrink-0">
            <Link href="/pets">
              <Search className="size-4 mr-2" />
              Browse Available Pets
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Recently Added Pets Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Recently Added Pets</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/pets" className="text-xs">
              View all available pets
              <ArrowRight className="size-3 ml-1" />
            </Link>
          </Button>
        </div>
        <Suspense fallback={<RecentPetsSkeleton />}>
          <RecentPetsGrid userId={userId} />
        </Suspense>
      </div>
    </div>
  )
}
