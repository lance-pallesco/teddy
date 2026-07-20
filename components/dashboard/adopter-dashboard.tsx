import { Suspense } from "react"
import Link from "next/link"
import { ClipboardList, FileHeart, CalendarRange, ArrowRight, Search, HeartHandshake, FileText, CheckCircle, Check, AlertCircle, MessageSquare } from "lucide-react"

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
import { cn } from "@/lib/utils"

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
      status: { notIn: ["DRAFT", "REJECTED", "WITHDRAWN"] },
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
          <CardContent className="p-4 space-y-4">
            {activeApplications.map((app) => {
              const petImage = app.pet.petImages[0]?.url
              // Map status to active step index (0-based)
              let activeStep = 0
              if (app.status === "UNDER_REVIEW") activeStep = 1
              if (app.status === "INTERVIEW_IN_PROGRESS") activeStep = 2
              if (app.status === "APPROVED") activeStep = 3

              const steps = [
                { label: "Submitted", desc: "Form received", icon: FileText },
                { label: "Screening", desc: "Background check", icon: Search },
                { label: "Interview", desc: "Interactive chat", icon: MessageSquare },
                { label: "Approved", desc: "Ready for adoption", icon: CheckCircle },
              ]

              const isTerminated = ["REJECTED", "WITHDRAWN"].includes(app.status)

              return (
                <div key={app.id} className="border border-border/60 rounded-xl p-5 hover:shadow-xs transition-shadow bg-background/50 flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Left Side: Pet Info & Navigation */}
                  <div className="flex items-center gap-4 lg:w-1/4 shrink-0 border-b lg:border-b-0 pb-4 lg:pb-0 border-border/50">
                    <div className="relative size-16 rounded-xl border border-primary/10 overflow-hidden shadow-xs shrink-0">
                      {petImage ? (
                        <img src={petImage} alt={app.pet.name} className="object-cover size-full" />
                      ) : (
                        <div className="flex size-full items-center justify-center text-[#AE8F65] bg-[#AE8F65]/5 text-lg font-bold">
                          🐾
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-foreground">
                        Adopting {app.pet.name}
                      </h4>
                      <p className="text-[10px] text-muted-foreground">
                        Updated {new Date(app.updatedAt).toLocaleDateString()}
                      </p>
                      <Button asChild size="sm" variant="link" className="h-6 p-0 text-xs font-semibold text-[#AE8F65] hover:text-[#9A7D58] justify-start">
                        <Link href={`/applications/${app.id}`} className="flex items-center gap-1">
                          View details <ArrowRight className="size-3" />
                        </Link>
                      </Button>
                    </div>
                  </div>

                  {/* Right Side: Step Tracker */}
                  <div className="flex-1">
                    {!isTerminated ? (
                      // Stepper flow
                      <div className="flex items-center w-full relative py-2">
                        {/* Background track line */}
                        <div className="absolute top-[26px] sm:top-[30px] left-[12.5%] right-[12.5%] h-0.5 bg-muted z-0" />

                        {/* Active progress track line */}
                        <div
                          className="absolute top-[26px] sm:top-[30px] left-[12.5%] h-0.5 transition-all duration-500 z-0"
                          style={{
                            width: `${(activeStep / 3) * 75}%`,
                            background: activeStep === 3
                              ? "#10b981"
                              : "linear-gradient(to right, #10b981, #ae8f65)"
                          }}
                        />

                        {steps.map((step, idx) => {
                          const isDone = idx < activeStep
                          const isCurrent = idx === activeStep
                          const StepIcon = step.icon

                          return (
                            <div key={step.label} className="w-1/4 flex flex-col items-center text-center space-y-1">
                              <div
                                className={cn(
                                  "size-9 sm:size-11 rounded-full flex items-center justify-center border-2 transition-all duration-300 relative z-10",
                                  isCurrent
                                    ? "bg-[#AE8F65] border-[#AE8F65] text-white scale-110 shadow-md ring-4 ring-[#AE8F65]/10"
                                    : isDone
                                      ? "bg-emerald-500 border-emerald-500 text-white"
                                      : "bg-white border-border text-muted-foreground"
                                )}
                              >
                                {isDone ? (
                                  <Check className="size-4 sm:size-5 stroke-[2.5]" />
                                ) : (
                                  <StepIcon className="size-4 sm:size-5" />
                                )}
                              </div>
                              <div className="space-y-0.5">
                                <p
                                  className={cn(
                                    "text-[10px] sm:text-xs font-bold leading-tight",
                                    isCurrent
                                      ? "text-[#AE8F65]"
                                      : isDone
                                        ? "text-emerald-600"
                                        : "text-muted-foreground"
                                  )}
                                >
                                  {step.label}
                                </p>
                                <p className="hidden sm:block text-[9px] text-muted-foreground/80 leading-none">
                                  {step.desc}
                                </p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      // Finalized Message
                      <div className={cn(
                        "rounded-lg p-3.5 border flex items-center gap-3",
                        app.status === "REJECTED"
                          ? "bg-destructive/5 border-destructive/10 text-destructive"
                          : "bg-muted border-border text-muted-foreground"
                      )}>
                        <AlertCircle className="size-4 shrink-0" />
                        <div className="text-xs text-left">
                          <p className="font-bold">
                            Application {app.status === "REJECTED" ? "Rejected" : "Withdrawn"}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 leading-normal">
                            {app.status === "REJECTED"
                              ? `Thank you for your interest in adopting ${app.pet.name}. Unfortunately, the shelter staff has decided to reject this application.`
                              : `You have successfully withdrawn your adoption application for ${app.pet.name}.`}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
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
