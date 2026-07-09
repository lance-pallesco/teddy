import { Suspense } from "react"
import Link from "next/link"
import { ClipboardList, FileHeart, CalendarRange, ArrowRight, Search, HeartHandshake, FileText, CheckCircle } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatsGridSkeleton, RecentPetsSkeleton } from "@/components/dashboard/DashboardSkeleton"
import { PetCard } from "@/components/pets/pet-card"
import { getAdopterStats } from "@/lib/services/dashboard.service"
import { getPets } from "@/lib/services/pet.service"
import { prisma } from "@/lib/prisma"
import { ApplicationTimeline } from "@/components/applications/application-timeline"
import { TeddyBanner } from "@/components/dashboard/teddy-banner"

type AdopterDashboardProps = {
  userId: string
}

async function AdopterStatsGrid({ userId }: { userId: string }) {
  const stats = await getAdopterStats(userId)

  // Fetch draft applications for reminders
  const drafts = await prisma.adoptionApplication.findMany({
    where: { applicantId: userId, status: "DRAFT", deletedAt: null },
    include: { pet: true },
    orderBy: { updatedAt: "desc" },
    take: 1,
  })

  return (
    <div className="space-y-6">
      {/* Section 0: Draft Reminder Banner */}
      {drafts.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xl shrink-0">📝</span>
            <div>
              <p className="text-xs font-bold text-foreground">Draft Application Reminder</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                You started an application for <strong>{drafts[0].pet.name}</strong> but didn't finish. Resume to complete your submission.
              </p>
            </div>
          </div>
          <Button asChild size="sm" variant="default" className="w-full sm:w-auto text-xs shrink-0 bg-amber-500 hover:bg-amber-600 hover:text-white text-white">
            <Link href={`/pets/${drafts[0].pet.id}/apply`}>Resume Application</Link>
          </Button>
        </div>
      )}

      {/* Grid Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
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

        <Card className="shadow-xs border border-primary/10 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Under Review / Chat</CardTitle>
            <FileHeart className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.applications.UNDER_REVIEW + stats.applications.INTERVIEW_IN_PROGRESS}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Applications in review or discussion</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border border-primary/10 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
            <CalendarRange className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.applications.APPROVED}</div>
            <p className="text-xs text-muted-foreground mt-1">Adoption requests approved</p>
          </CardContent>
        </Card>
      </div>
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
      {/* <PageHeader
        title="Dashboard"
        subtitle="Track your applications and explore available pets."
      /> */}

      {/* Welcome Mascot Banner */}
      <Suspense fallback={<div className="h-44 w-full rounded-2xl bg-[#F5EBE0]/30 border border-[#EADBC8]/40 animate-pulse" />}>
        <TeddyBanner userId={userId} />
      </Suspense>

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
            <h2 className="text-2xl tracking-tight text-[#3D3C3A]">Find Your Perfect Companion</h2>
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
