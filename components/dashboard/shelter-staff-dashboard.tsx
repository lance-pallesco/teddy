import { Suspense } from "react"
import Link from "next/link"
import { PawPrint, ClipboardList, FileHeart, CalendarRange, Plus, ArrowRight, MessageSquare, AlertCircle, Clock } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatsGridSkeleton } from "@/components/dashboard/DashboardSkeleton"
import { getShelterStaffStats } from "@/lib/services/dashboard.service"
import { prisma } from "@/lib/prisma"
import { TeddyBanner } from "@/components/dashboard/teddy-banner"

type ShelterStaffDashboardProps = {
  userId: string
  shelterId: string
}

async function ShelterStaffStatsGrid({ shelterId }: { shelterId: string }) {
  const stats = await getShelterStaffStats(shelterId)

  // Fetch priority inbox applications (pending, oldest first)
  const priorityApplications = await prisma.adoptionApplication.findMany({
    where: {
      deletedAt: null,
      status: { in: ["PENDING", "UNDER_REVIEW"] },
      pet: { shelterId },
    },
    orderBy: { createdAt: "asc" },
    take: 3,
    include: {
      applicant: { select: { firstName: true, lastName: true } },
      pet: { select: { name: true } },
    },
  })

  // Fetch active interviews and meet-and-greets
  const activeInterviews = await prisma.adoptionApplication.findMany({
    where: {
      deletedAt: null,
      status: { in: ["INTERVIEW_IN_PROGRESS", "APPROVED"] },
      pet: { shelterId },
    },
    orderBy: { updatedAt: "desc" },
    take: 3,
    include: {
      applicant: { select: { firstName: true, lastName: true } },
      pet: { select: { name: true } },
    },
  })

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
          <p className="text-sm text-muted-foreground mt-0.5 font-medium">Shelter overview dashboard and actions.</p>
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

      {/* Operational Sections */}
      <div className="grid gap-6 md:grid-cols-2 pt-4">
        {/* Section A: Priority Review Inbox */}
        <Card className="border border-primary/10 shadow-xs flex flex-col">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5 uppercase tracking-wider">
              <AlertCircle className="size-4 text-amber-500 animate-pulse" /> Priority Review Inbox
            </CardTitle>
            <CardDescription className="text-xs">
              Oldest unreviewed applications needing attention
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 flex-1 flex flex-col justify-between">
            {priorityApplications.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">Inbox clean! No pending applications.</p>
            ) : (
              <div className="space-y-3">
                {priorityApplications.map((app) => (
                  <div key={app.id} className="flex items-center justify-between border-b pb-2.5 last:border-0 last:pb-0">
                    <div className="space-y-0.5">
                      <span className="font-semibold text-xs text-foreground block">
                        {app.applicant.firstName} {app.applicant.lastName}
                      </span>
                      <span className="text-[10px] text-muted-foreground block">
                        Applying to adopt <strong>{app.pet.name}</strong>
                      </span>
                    </div>
                    <Button asChild size="sm" variant="outline" className="h-7 text-xs">
                      <Link href={`/applications/${app.id}`}>Review</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section B: Active Chats & Meet & Greets */}
        <Card className="border border-primary/10 shadow-xs flex flex-col">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5 uppercase tracking-wider">
              <Clock className="size-4 text-emerald-500" /> Interview & Meet schedule
            </CardTitle>
            <CardDescription className="text-xs">
              Active structured chats and approved meetings
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 flex-1 flex flex-col justify-between">
            {activeInterviews.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">No active interviews or meetups scheduled.</p>
            ) : (
              <div className="space-y-3">
                {activeInterviews.map((app) => (
                  <div key={app.id} className="flex items-center justify-between border-b pb-2.5 last:border-0 last:pb-0">
                    <div className="space-y-0.5">
                      <span className="font-semibold text-xs text-foreground block flex items-center gap-1.5">
                        {app.applicant.firstName} {app.applicant.lastName}
                        <Badge variant={app.status === "INTERVIEW_IN_PROGRESS" ? "default" : "success"} className="text-[8px] h-3 px-1">
                          {app.status === "INTERVIEW_IN_PROGRESS" ? "Interview" : "Meet & Greet"}
                        </Badge>
                      </span>
                      <span className="text-[10px] text-muted-foreground block">
                        Pet: <strong>{app.pet.name}</strong>
                      </span>
                    </div>
                    {app.status === "INTERVIEW_IN_PROGRESS" ? (
                      <Button asChild size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Link href={`/applications/${app.id}/chat`}>
                          <MessageSquare className="size-3 mr-1" /> Chat
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild size="sm" variant="outline" className="h-7 text-xs">
                        <Link href={`/applications/${app.id}`}>Details</Link>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
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
