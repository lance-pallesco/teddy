import { Suspense } from "react"
import Link from "next/link"
import { Building2, Users, PawPrint, ClipboardList, ArrowRight } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatsCardSkeleton } from "@/components/dashboard/DashboardSkeleton"
import { TeddyBanner } from "@/components/dashboard/teddy-banner"
import {
  getShelterStats,
  getUserStats,
  getPetStats,
  getMonthlyApplicationStats,
} from "@/lib/services/dashboard.service"

// ---------- Async Stat Card Components ----------

async function ShelterStatsCard() {
  const stats = await getShelterStats()
  return (
    <Card className="shadow-xs border border-primary/10 hover:shadow-md transition-shadow">
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
    <Card className="shadow-xs border border-primary/10 hover:shadow-md transition-shadow">
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
    <Card className="shadow-xs border border-primary/10 hover:shadow-md transition-shadow">
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
    <Card className="shadow-xs border border-primary/10 hover:shadow-md transition-shadow">
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

// ---------- Main Component ----------

export function SuperAdminDashboard({ userId }: { userId: string }) {
  return (
    <div className="space-y-6">
      {/* Welcome Mascot Banner */}
      <Suspense fallback={<div className="h-44 w-full rounded-2xl bg-[#F5EBE0]/30 border border-[#EADBC8]/40 animate-pulse" />}>
        <TeddyBanner userId={userId} />
      </Suspense>

      {/* Quick Action Links */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="flex items-center justify-between p-6 border bg-gradient-to-br from-primary/5 via-background to-background hover:border-primary/30 transition-all">
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

        <Card className="flex items-center justify-between p-6 border bg-gradient-to-br from-primary/5 via-background to-background hover:border-primary/30 transition-all">
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
      </div>

      {/* Statistics Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">System Metrics</h2>
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
      <div className="grid gap-6 md:grid-cols-2 pt-4">
        <PlatformGrowthChart />
        <AdoptionFunnelChart />
      </div>
    </div>
  )
}

function PlatformGrowthChart() {
  return (
    <Card className="border border-primary/10 shadow-xs">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Platform Growth (Past 6 Months)</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <svg className="w-full h-[200px]" viewBox="0 0 500 200">
          <line x1="50" y1="30" x2="450" y2="30" stroke="currentColor" strokeOpacity="0.1" strokeDasharray="4 4" />
          <line x1="50" y1="80" x2="450" y2="80" stroke="currentColor" strokeOpacity="0.1" strokeDasharray="4 4" />
          <line x1="50" y1="130" x2="450" y2="130" stroke="currentColor" strokeOpacity="0.1" strokeDasharray="4 4" />
          <line x1="50" y1="170" x2="450" y2="170" stroke="currentColor" strokeOpacity="0.2" />

          <text x="15" y="35" className="text-[10px] fill-muted-foreground font-medium">1,000</text>
          <text x="15" y="85" className="text-[10px] fill-muted-foreground font-medium">500</text>
          <text x="15" y="135" className="text-[10px] fill-muted-foreground font-medium">250</text>
          <text x="25" y="175" className="text-[10px] fill-muted-foreground font-medium">0</text>

          <defs>
            <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path
            d="M 50,170 L 50,165 L 130,150 L 210,130 L 290,105 L 370,75 L 450,45 L 450,170 Z"
            fill="url(#growthGrad)"
          />

          <path
            d="M 50,165 L 130,150 L 210,130 L 290,105 L 370,75 L 450,45"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          <circle cx="50" cy="165" r="4" className="fill-background stroke-primary stroke-2" />
          <circle cx="130" cy="150" r="4" className="fill-background stroke-primary stroke-2" />
          <circle cx="210" cy="130" r="4" className="fill-background stroke-primary stroke-2" />
          <circle cx="290" cy="105" r="4" className="fill-background stroke-primary stroke-2" />
          <circle cx="370" cy="75" r="4" className="fill-background stroke-primary stroke-2" />
          <circle cx="450" cy="45" r="4" className="fill-background stroke-primary stroke-2" />

          <text x="50" y="190" className="text-[10px] fill-muted-foreground font-medium" textAnchor="middle">Jan</text>
          <text x="130" y="190" className="text-[10px] fill-muted-foreground font-medium" textAnchor="middle">Feb</text>
          <text x="210" y="190" className="text-[10px] fill-muted-foreground font-medium" textAnchor="middle">Mar</text>
          <text x="290" y="190" className="text-[10px] fill-muted-foreground font-medium" textAnchor="middle">Apr</text>
          <text x="370" y="190" className="text-[10px] fill-muted-foreground font-medium" textAnchor="middle">May</text>
          <text x="450" y="190" className="text-[10px] fill-muted-foreground font-medium" textAnchor="middle">Jun</text>
        </svg>
      </CardContent>
    </Card>
  )
}

function AdoptionFunnelChart() {
  const steps = [
    { stage: "Submitted", count: 256, percent: 100, color: "bg-primary" },
    { stage: "Under Review", count: 184, percent: 72, color: "bg-amber-500" },
    { stage: "Interviews", count: 96, percent: 37, color: "bg-purple-500" },
    { stage: "Approved M&G", count: 48, percent: 18, color: "bg-emerald-500" },
  ]
  return (
    <Card className="border border-primary/10 shadow-xs">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Adoption Process Funnel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.map((step) => (
          <div key={step.stage} className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-foreground">{step.stage}</span>
              <span className="text-muted-foreground font-medium">{step.count} ({step.percent}%)</span>
            </div>
            <div className="w-full bg-muted rounded-lg h-5 overflow-hidden relative flex items-center">
              <div
                className={`${step.color} h-full rounded-lg transition-all duration-500`}
                style={{ width: `${step.percent}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
