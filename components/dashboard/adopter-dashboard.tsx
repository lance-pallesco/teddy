import { Suspense } from "react"
import Link from "next/link"
import { ClipboardList, FileHeart, CalendarRange, ArrowRight, FileText, Search, MessageSquare, CheckCircle, Check, AlertCircle } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatsGridSkeleton, RecentPetsSkeleton } from "@/components/dashboard/DashboardSkeleton"
import { getAdopterStats } from "@/lib/services/dashboard.service"
import { getPets } from "@/lib/services/pet.service"
import { prisma } from "@/lib/prisma"
import { DeleteDraftButton } from "@/components/applications/delete-draft-button"
import { TeddyBanner } from "@/components/dashboard/teddy-banner"
import { PetDiscoveryCard } from "@/components/dashboard/pet-discovery-card"
import { cn } from "@/lib/utils"

type AdopterDashboardProps = {
  userId: string
}

async function AdopterStatsGrid({ userId }: { userId: string }) {
  const stats = await getAdopterStats(userId)

  // Fetch draft applications for reminders
  const drafts = await prisma.adoptionApplication.findMany({
    where: { applicantId: userId, status: "DRAFT", deletedAt: null },
    include: {
      pet: {
        include: {
          petImages: {
            orderBy: { isPrimary: "desc" },
            take: 1,
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 1,
  })

  // Count total active in-progress applications
  const totalActiveCount = await prisma.adoptionApplication.count({
    where: {
      applicantId: userId,
      deletedAt: null,
      status: { notIn: ["DRAFT", "REJECTED", "WITHDRAWN", "APPROVED"] },
    },
  })

  // Fetch only the latest active in-progress application for pipeline tracker
  const activeApplications = await prisma.adoptionApplication.findMany({
    where: {
      applicantId: userId,
      deletedAt: null,
      status: { notIn: ["DRAFT", "REJECTED", "WITHDRAWN", "APPROVED"] },
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
    take: 1,
  })

  return (
    <div className="space-y-6">
      {/* Draft Reminder Banner */}
      {drafts.length > 0 && (() => {
        const draftPet = drafts[0].pet
        const draftPetImage = draftPet.petImages?.[0]?.url
        return (
          <div className="relative overflow-hidden rounded-2xl border border-amber-300/60 bg-amber-500/10 p-4 sm:p-5 shadow-xs transition-all hover:shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-3.5 min-w-0">
                {draftPetImage ? (
                  <div className="relative size-12 sm:size-14 rounded-xl border border-amber-300/80 overflow-hidden shrink-0 shadow-xs">
                    <img src={draftPetImage} alt={draftPet.name} className="object-cover size-full" />
                  </div>
                ) : (
                  <div className="size-12 sm:size-14 rounded-xl bg-amber-500/20 text-[#AE8F65] flex items-center justify-center shrink-0 shadow-xs">
                    <FileText className="size-6" />
                  </div>
                )}
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="bg-amber-500/15 border-amber-400/40 text-amber-800 dark:text-amber-300 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
                      Draft Application
                    </Badge>
                  </div>
                  <h4 className="text-sm font-bold text-foreground truncate">
                    Unfinished Application for {draftPet.name}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-normal line-clamp-1">
                    You started an application for <strong>{draftPet.name}</strong>. Resume to complete and submit your application!
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <DeleteDraftButton
                  applicationId={drafts[0].id}
                  petName={draftPet.name}
                  variant="icon"
                />
                <Button asChild size="icon" className="size-9 rounded-xl bg-[#AE8F65] hover:bg-[#9A7D58] text-white shadow-xs cursor-pointer" title="Resume Application">
                  <Link href={`/pets/${draftPet.id}/apply`}>
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Top Metric Stats Bar */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="shadow-xs border border-border bg-white p-4 flex items-center justify-between">
          <div>
            <CardTitle className="text-xs font-semibold text-muted-foreground">Active Applications</CardTitle>
            <div className="text-2xl font-bold text-foreground mt-1">{stats.applications.PENDING}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Pending review</p>
          </div>
          <div className="p-2.5 rounded-xl bg-[#AE8F65]/10 text-[#AE8F65]">
            <ClipboardList className="size-5" />
          </div>
        </Card>

        <Card className="shadow-xs border border-border bg-white p-4 flex items-center justify-between">
          <div>
            <CardTitle className="text-xs font-semibold text-muted-foreground">Under Review / Chat</CardTitle>
            <div className="text-2xl font-bold text-foreground mt-1">
              {stats.applications.UNDER_REVIEW + stats.applications.INTERVIEW_IN_PROGRESS}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">In discussion</p>
          </div>
          <div className="p-2.5 rounded-xl bg-[#AE8F65]/10 text-[#AE8F65]">
            <FileHeart className="size-5" />
          </div>
        </Card>

        <Card className="shadow-xs border border-border bg-white p-4 flex items-center justify-between">
          <div>
            <CardTitle className="text-xs font-semibold text-muted-foreground">Approved</CardTitle>
            <div className="text-2xl font-bold text-foreground mt-1">{stats.applications.APPROVED}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Ready for adoption</p>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
            <CalendarRange className="size-5" />
          </div>
        </Card>
      </div>

      {/* Application Progress Tracker (Full Width, Conditional) */}
      {activeApplications.length > 0 && (
        <Card className="border border-border shadow-xs bg-white">
          <CardHeader className="pb-3 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-foreground">
                My Application Progress Tracker
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Real-time pipeline tracking for your latest active adoption request
              </CardDescription>
            </div>
            {totalActiveCount > 1 && (
              <Button asChild variant="outline" size="sm" className="text-xs h-8 border-border hover:bg-muted/50 rounded-lg shrink-0">
                <Link href="/applications" className="flex items-center gap-1">
                  View All ({totalActiveCount})
                  <ArrowRight className="size-3" />
                </Link>
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {activeApplications.map((app) => {
              const petImage = app.pet.petImages[0]?.url
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
                  <div className="flex items-center gap-4 lg:w-1/5 shrink-0 border-b lg:border-b-0 pb-4 lg:pb-0 border-border/50">
                    <div className="relative size-16 rounded-xl border border-border overflow-hidden shadow-xs shrink-0 bg-muted">
                      {petImage ? (
                        <img src={petImage} alt={app.pet.name} className="object-cover size-full" />
                      ) : (
                        <div className="flex size-full items-center justify-center text-muted-foreground text-xs font-bold">
                          No Image
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
                      <div className="flex items-center w-full relative py-2">
                        <div className="absolute top-[26px] sm:top-[30px] left-[12.5%] right-[12.5%] h-0.5 bg-muted z-0" />
                        <div
                          className="absolute top-[26px] sm:top-[30px] left-[12.5%] h-0.5 transition-all duration-500 z-0"
                          style={{
                            width: `${(activeStep / 3) * 75}%`,
                            background: "linear-gradient(to right, #10b981, #ae8f65)"
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
                                  "size-9 sm:size-11 rounded-full flex items-center justify-center border-2 transition-all duration-300 relative z-10 text-xs font-bold",
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
                      <div className={cn(
                        "rounded-lg p-3.5 border flex items-center gap-3",
                        app.status === "REJECTED"
                          ? "bg-destructive/5 border-destructive/10 text-destructive"
                          : "bg-muted border-border text-muted-foreground"
                      )}>
                        <AlertCircle className="size-4 shrink-0" />
                        <p className="text-xs font-medium">
                          {app.status === "REJECTED"
                            ? "Application was declined. Feel free to explore other companion pets."
                            : "Application was withdrawn."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {totalActiveCount > 1 && (
              <div className="pt-3 flex justify-center border-t border-border/50">
                <Button asChild variant="ghost" size="sm" className="text-xs font-semibold text-[#AE8F65] hover:text-[#9A7D58] hover:bg-[#AE8F65]/5">
                  <Link href="/applications" className="flex items-center gap-1.5">
                    Show more applications ({totalActiveCount - 1} more)
                    <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

async function PetDiscoverySection({ userId }: { userId: string }) {
  // Fetch all active available pets for the carousel
  const result = await getPets(
    { userId, role: "ADOPTER", shelterId: null },
    { tab: "active" },
    1,
    50 // Fetch all available active pets
  )

  const miniPets = result.pets.map((pet) => ({
    id: pet.id,
    name: pet.name,
    breed: pet.breed,
    species: pet.species,
    gender: pet.gender,
    ageLabel: pet.ageLabel,
    sizeLabel: pet.sizeLabel,
    location: pet.location,
    imageUrl: pet.primaryImageUrl ?? null,
  }))

  return <PetDiscoveryCard pets={miniPets} />
}

export function AdopterDashboard({ userId }: AdopterDashboardProps) {
  return (
    <div className="space-y-8">
      {/* Welcome Mascot Banner */}
      <Suspense fallback={<div className="h-44 w-full rounded-2xl bg-[#F5EBE0]/30 border border-[#EADBC8]/40 animate-pulse" />}>
        <TeddyBanner userId={userId} />
      </Suspense>

      {/* Stats, Draft Banner & Progress Tracker */}
      <Suspense fallback={<StatsGridSkeleton count={3} />}>
        <AdopterStatsGrid userId={userId} />
      </Suspense>

      {/* Unified Pet Discovery Card with Carousel */}
      <Suspense fallback={<RecentPetsSkeleton />}>
        <PetDiscoverySection userId={userId} />
      </Suspense>
    </div>
  )
}
