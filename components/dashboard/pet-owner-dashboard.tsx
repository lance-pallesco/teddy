import { Suspense } from "react"
import Link from "next/link"
import { PawPrint, ClipboardList, FileHeart, CalendarRange, Plus, ArrowRight, TrendingUp } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatsGridSkeleton } from "@/components/dashboard/DashboardSkeleton"
import { getPetOwnerStats } from "@/lib/services/dashboard.service"
import { prisma } from "@/lib/prisma"

type PetOwnerDashboardProps = {
  userId: string
}

async function PetOwnerStatsGrid({ userId }: { userId: string }) {
  const stats = await getPetOwnerStats(userId)

  // Fetch listed pets with application count
  const myPets = await prisma.pet.findMany({
    where: { postedById: userId },
    select: {
      id: true,
      name: true,
      status: true,
      createdAt: true,
      _count: {
        select: {
          adoption: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  })

  // Calculate adoption metrics
  const totalListed = stats.pets.AVAILABLE + stats.pets.PENDING + stats.pets.ADOPTED + stats.pets.RESERVED + stats.pets.MEDICAL_HOLD
  const adoptionRate = totalListed > 0 ? Math.round((stats.pets.ADOPTED / totalListed) * 100) : 0

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

      {/* Fostering Insights */}
      <div className="grid gap-6 md:grid-cols-3 pt-4">
        {/* Card A: My Impact */}
        <Card className="border border-primary/10 shadow-xs md:col-span-1 flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="size-4 text-emerald-500" /> My Foster Impact
            </CardTitle>
            <CardDescription className="text-xs">
              Lifetime stats for your foster care listings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-6 pt-0">
            <div className="flex items-end justify-between border-b pb-3">
              <span className="text-xs text-muted-foreground">Adoption Rate</span>
              <span className="text-2xl font-black text-emerald-600">{adoptionRate}%</span>
            </div>
            <div className="flex items-end justify-between border-b pb-3">
              <span className="text-xs text-muted-foreground">Total Listings Posted</span>
              <span className="text-sm font-bold">{totalListed} listings</span>
            </div>
            <div className="flex items-end justify-between pb-1">
              <span className="text-xs text-muted-foreground">Placed in Forever Homes</span>
              <span className="text-sm font-bold text-emerald-600">{stats.pets.ADOPTED} pets</span>
            </div>
          </CardContent>
        </Card>

        {/* Card B: My Listings Performance Table */}
        <Card className="border border-primary/10 shadow-xs md:col-span-2 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold uppercase tracking-wider">
              My Fosters Performance
            </CardTitle>
            <CardDescription className="text-xs">
              Applications activity for your posted pet listings
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-x-auto">
            {myPets.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-12">No fosters listed yet.</p>
            ) : (
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-y bg-muted/20 font-semibold text-muted-foreground">
                    <th className="p-3">Pet Name</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-center">Applications</th>
                    <th className="p-3">Days Listed</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {myPets.map((pet) => {
                    const daysListed = Math.round(
                      (new Date().getTime() - new Date(pet.createdAt).getTime()) / (1000 * 3600 * 24)
                    )
                    return (
                      <tr key={pet.id} className="hover:bg-muted/10">
                        <td className="p-3 font-semibold text-foreground">{pet.name}</td>
                        <td className="p-3">
                          <Badge variant={pet.status === "AVAILABLE" ? "success" : "secondary"} className="text-[10px]">
                            {pet.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-center font-semibold">{pet._count.adoption}</td>
                        <td className="p-3 text-muted-foreground">{daysListed} day(s) ago</td>
                        <td className="p-3 text-right">
                          <Button asChild size="icon" variant="ghost" className="size-7 rounded-full">
                            <Link href={`/pets/${pet.id}`}>
                              <ArrowRight className="size-3.5" />
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
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
