import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  Building2Icon,
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  PawPrintIcon,
  UsersIcon,
  HeartHandshakeIcon,
  ClipboardListIcon,
  TimerIcon,
} from "lucide-react"

import { requireRole } from "@/lib/auth/require-role"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getShelterAnalyticsData } from "@/lib/services/analytics.service"
import { ShelterAnalyticsCharts } from "@/components/analytics/shelter-analytics-charts"

export default async function MyShelterProfilePage() {
  const user = await requireRole(["SHELTER_STAFF"])
  if (!user.shelterId) {
    notFound()
  }

  const shelter = await prisma.shelter.findUnique({
    where: { id: user.shelterId },
    include: {
      users: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          avatar: true,
        },
        orderBy: {
          lastName: "asc",
        },
      },
      pets: {
        where: {
          status: { not: "ARCHIVED" },
        },
        include: {
          petImages: {
            orderBy: { isPrimary: "desc" },
            take: 1,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  })

  if (!shelter) {
    notFound()
  }

  const analyticsData = await getShelterAnalyticsData(user.shelterId)
  const petsCount = shelter.pets.length
  const staffCount = shelter.users.length

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#3D3C3A]">My Shelter</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Overview of your shelter&apos;s details, associated staff, and current pet listings.
          </p>
        </div>

        {/* 2-Column Layout */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column: Shelter Detail Summary Card */}
          <div className="lg:col-span-1">
            <Card className="lg:sticky lg:top-6 border-primary/15 bg-muted/20 overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                  Shelter Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Logo */}
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted border">
                  {shelter.logo ? (
                    <Image
                      src={shelter.logo}
                      alt={shelter.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 30vw"
                      unoptimized={shelter.logo.startsWith("/uploads/")}
                    />
                  ) : (
                    <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Building2Icon className="size-10 opacity-60" />
                      <span className="text-xs">No Logo Uploaded</span>
                    </div>
                  )}
                </div>

                {/* Main details */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xl font-bold tracking-tight">{shelter.name}</h3>
                    <Badge variant={shelter.isActive ? "success" : "secondary"}>
                      {shelter.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <p className="text-sm leading-relaxed text-muted-foreground text-justify">
                    {shelter.description}
                  </p>

                  <div className="space-y-1.5 pt-3 text-xs text-muted-foreground border-t">
                    <div className="flex items-start gap-1.5">
                      <MapPinIcon className="size-3.5 text-primary shrink-0 mt-0.5" />
                      <span>
                        {shelter.address}
                        {shelter.barangay && `, ${shelter.barangay}`}
                        {`, ${shelter.city}, ${shelter.province}`}
                        {shelter.postalCode && ` ${shelter.postalCode}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <PhoneIcon className="size-3.5 text-primary shrink-0" />
                      <span>{shelter.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MailIcon className="size-3.5 text-primary shrink-0" />
                      <span>{shelter.email}</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 border-t pt-3 text-center">
                  <div className="rounded-lg bg-background p-2 border">
                    <p className="text-lg font-bold text-foreground">{petsCount}</p>
                    <p className="text-[10px] uppercase font-semibold text-muted-foreground">Pets Listed</p>
                  </div>
                  <div className="rounded-lg bg-background p-2 border">
                    <p className="text-lg font-bold text-foreground">{staffCount}</p>
                    <p className="text-[10px] uppercase font-semibold text-muted-foreground">Staff Members</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Staff Members and Pet Gallery */}
          <div className="lg:col-span-2 space-y-6">
            {/* Staff list card */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <UsersIcon className="size-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">Associated Staff</CardTitle>
                    <CardDescription>Members of this shelter who can manage listings and adoption requests.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {shelter.users.map((staff) => (
                    <div key={staff.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/10 transition-colors">
                      <div className="relative size-10 rounded-full bg-muted border overflow-hidden shrink-0">
                        {staff.avatar ? (
                          <Image
                            src={staff.avatar}
                            alt={`${staff.firstName} ${staff.lastName}`}
                            fill
                            className="object-cover"
                            sizes="40px"
                            unoptimized={staff.avatar.startsWith("/uploads/")}
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center text-muted-foreground bg-primary/5 text-primary text-xs font-bold">
                            {staff.firstName[0]}
                            {staff.lastName[0]}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-semibold text-foreground truncate">
                          {staff.firstName} {staff.lastName}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate">{staff.email}</p>
                      </div>
                      <Badge variant="outline" className="text-[9px] uppercase tracking-wider font-semibold border-primary/20 bg-primary/5 text-primary shrink-0">
                        {staff.role === "SHELTER_STAFF" ? "Staff" : staff.role.replace("_", " ")}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pets list card */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <PawPrintIcon className="size-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">Shelter Pets</CardTitle>
                    <CardDescription>Active listings currently managed by your shelter.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {shelter.pets.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed rounded-lg bg-muted/10">
                    <PawPrintIcon className="size-10 text-muted-foreground opacity-40 mb-2" />
                    <h5 className="font-semibold text-sm">No pets listed yet</h5>
                    <p className="text-xs text-muted-foreground max-w-xs mt-0.5">
                      Your shelter has not posted any active pets yet. Head to My Pets to create one.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {shelter.pets.map((pet) => {
                      const primaryImage =
                        pet.petImages.find((img) => img.isPrimary)?.url ??
                        pet.petImages[0]?.url

                      return (
                        <Link
                          key={pet.id}
                          href={`/pets/${pet.id}`}
                          className="group block text-center space-y-1 hover:opacity-90 transition-opacity"
                        >
                          <div className="relative aspect-square rounded-lg bg-muted border overflow-hidden">
                            {primaryImage ? (
                              <Image
                                src={primaryImage}
                                alt={pet.name}
                                fill
                                className="object-cover"
                                sizes="120px"
                                unoptimized={primaryImage.startsWith("/uploads/")}
                              />
                            ) : (
                              <div className="flex size-full items-center justify-center text-muted-foreground">
                                <PawPrintIcon className="size-6 opacity-40" />
                              </div>
                            )}
                          </div>
                          <div className="text-xs font-semibold truncate px-1 text-foreground pt-1">{pet.name}</div>
                          <div className="text-[10px] text-muted-foreground truncate">{pet.breed ?? pet.species}</div>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Shelter Operational Analytics section */}
        <div className="pt-6 border-t space-y-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#3D3C3A]">Shelter Performance & Analytics</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Review current metrics and application volumes specific to your shelter.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="bg-white dark:bg-[#1E1A16] border border-primary/10 text-center p-4">
              <div className="flex items-center justify-center size-8 rounded-full bg-emerald-500/10 text-emerald-600 mx-auto mb-2">
                <HeartHandshakeIcon className="size-4" />
              </div>
              <p className="text-lg font-bold text-emerald-600">{analyticsData.adoptedPets}</p>
              <p className="text-[10px] uppercase font-semibold text-muted-foreground">Adoptions Completed</p>
            </Card>

            <Card className="bg-white dark:bg-[#1E1A16] border border-primary/10 text-center p-4">
              <div className="flex items-center justify-center size-8 rounded-full bg-primary/10 text-primary mx-auto mb-2">
                <ClipboardListIcon className="size-4" />
              </div>
              <p className="text-lg font-bold text-foreground">{analyticsData.totalApplications}</p>
              <p className="text-[10px] uppercase font-semibold text-muted-foreground">Total Applications</p>
            </Card>

            <Card className="bg-white dark:bg-[#1E1A16] border border-primary/10 text-center p-4">
              <div className="flex items-center justify-center size-8 rounded-full bg-amber-500/10 text-amber-600 mx-auto mb-2">
                <ClipboardListIcon className="size-4" />
              </div>
              <p className="text-lg font-bold text-amber-600">{analyticsData.pendingApplications}</p>
              <p className="text-[10px] uppercase font-semibold text-muted-foreground">Pending Review</p>
            </Card>

            <Card className="bg-white dark:bg-[#1E1A16] border border-primary/10 text-center p-4">
              <div className="flex items-center justify-center size-8 rounded-full bg-rose-500/10 text-rose-600 mx-auto mb-2">
                <TimerIcon className="size-4" />
              </div>
              <p className="text-lg font-bold text-rose-600">{analyticsData.avgDaysToAdopt} days</p>
              <p className="text-[10px] uppercase font-semibold text-muted-foreground">Avg. Days to Adopt</p>
            </Card>
          </div>

          <ShelterAnalyticsCharts data={analyticsData} />
        </div>
      </div>
    </div>
  )
}
