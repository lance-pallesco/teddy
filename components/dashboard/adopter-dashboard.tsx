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

  // Fetch active applications for pipeline tracker
  const activeApplications = await prisma.adoptionApplication.findMany({
    where: {
      applicantId: userId,
      deletedAt: null,
      status: { not: "DRAFT" },
    },
    include: {
      pet: {
        select: {
          name: true,
          species: true,
          petImages: {
            orderBy: { isPrimary: "desc" },
            take: 1,
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 3,
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
        <Card className="shadow-xs border border-primary/10 hover:shadow-md transition-shadow bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Applications</CardTitle>
            <ClipboardList className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.applications.PENDING}</div>
            <p className="text-xs text-muted-foreground mt-1">Applications currently pending review</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border border-primary/10 hover:shadow-md transition-shadow bg-white">
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

        <Card className="shadow-xs border border-primary/10 hover:shadow-md transition-shadow bg-white">
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

      {/* Adoption Progress Pipeline Trackers */}
      {activeApplications.length > 0 && (
        <Card className="border border-primary/10 shadow-xs bg-white">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-sm font-bold uppercase tracking-wider">
              My Application Progress Tracker
            </CardTitle>
            <CardDescription className="text-xs">
              Real-time pipeline tracking steps of your active adoption requests
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-5 divide-y divide-border">
            {activeApplications.map((app, index) => {
              const petImage = app.pet.petImages[0]?.url
              // Map status to active step index (0-based)
              let activeStep = 0
              if (app.status === "UNDER_REVIEW") activeStep = 1
              if (app.status === "INTERVIEW_IN_PROGRESS") activeStep = 2
              if (app.status === "APPROVED") activeStep = 3

              const steps = ["Submitted", "Screening", "Interview", "Approved"]
              const isTerminated = ["REJECTED", "WITHDRAWN"].includes(app.status)

              return (
                <div key={app.id} className={`flex flex-col gap-4 ${index > 0 ? "pt-4" : ""}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative size-10 rounded-lg bg-muted border overflow-hidden shrink-0">
                        {petImage ? (
                          <img
                            src={petImage}
                            alt={app.pet.name}
                            className="object-cover size-full"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center text-muted-foreground bg-primary/5 text-primary text-xs font-bold">
                            🐾
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-foreground">
                          Adoption request for {app.pet.name}
                        </h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Last updated {new Date(app.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        app.status === "APPROVED"
                          ? "success"
                          : isTerminated
                            ? "danger"
                            : "default"
                      }
                      className="text-[9px] uppercase font-semibold"
                    >
                      {app.status}
                    </Badge>
                  </div>

                  {/* Progress Line */}
                  {!isTerminated ? (
                    <div className="w-full flex items-center justify-between relative px-2 py-1">
                      <div className="absolute top-1/2 left-4 right-4 h-0.5 -translate-y-1/2 bg-muted -z-10" />
                      <div
                        className="absolute top-1/2 left-4 h-0.5 -translate-y-1/2 bg-primary transition-all duration-500 -z-10"
                        style={{ width: `${(activeStep / 3) * 90}%` }}
                      />

                      {steps.map((step, idx) => {
                        const isDone = idx <= activeStep
                        const isCurrent = idx === activeStep
                        return (
                          <div key={step} className="flex flex-col items-center gap-1.5">
                            <div
                              className={`size-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all duration-300 ${
                                isCurrent
                                  ? "bg-primary border-primary text-white scale-110 shadow-xs"
                                  : isDone
                                    ? "bg-primary/20 border-primary text-primary"
                                    : "bg-white border-muted text-muted-foreground"
                              }`}
                            >
                              {idx + 1}
                            </div>
                            <span
                              className={`text-[9px] font-semibold tracking-tight transition-colors ${
                                isDone ? "text-foreground font-bold" : "text-muted-foreground"
                              }`}
                            >
                              {step}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-[11px] text-red-500 font-medium pl-13">
                      This application has been finalized as: {app.status.toLowerCase()}
                    </p>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}
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
