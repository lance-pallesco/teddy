import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  UsersIcon,
  PawPrintIcon,
  PlusIcon,
} from "lucide-react"

import { requireRole } from "@/lib/auth/require-role"
import { getShelterById } from "@/lib/services/shelter.service"
import { getShelterPets } from "@/lib/services/pet.service"
import { listShelterStaff } from "@/lib/services/user.service"
import { prisma } from "@/lib/prisma"

import { ShelterSummaryCard } from "@/components/shelters/shelter-summary-card"
import { SetBreadcrumbLabel } from "@/components/dashboard/breadcrumb-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type ShelterDetailPageProps = {
  params: Promise<{ id: string }>
}

export default async function ShelterDetailPage({
  params,
}: ShelterDetailPageProps) {
  await requireRole(["ADMIN"])

  const { id } = await params
  const shelter = await getShelterById(id)

  if (!shelter) {
    notFound()
  }

  const [staffMembers, shelterPetsResult, staffWithAvatars] = await Promise.all([
    listShelterStaff({ shelterId: id }),
    getShelterPets(id, 1, 100),
    prisma.user.findMany({
      where: { shelterId: id, role: "SHELTER_STAFF" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        avatar: true,
        isActive: true,
      },
      orderBy: { lastName: "asc" },
    }),
  ])

  const petsWithImages = await prisma.pet.findMany({
    where: { shelterId: id, status: { not: "ARCHIVED" } },
    include: {
      petImages: {
        orderBy: { isPrimary: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const stats = {
    petsCount: shelterPetsResult.total,
    staffCount: staffMembers.length,
  }

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <SetBreadcrumbLabel segment={id} label={shelter.name} />
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#3D3C3A]">
            {shelter.name}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Management overview for shelter operations, staff, and pets.
          </p>
        </div>

        {/* 2-Column Layout */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column: Shelter Summary Card */}
          <div className="lg:col-span-1">
            <ShelterSummaryCard
              variant="view"
              shelter={shelter}
              stats={stats}
            />
          </div>

          {/* Right Column: Staff + Pets */}
          <div className="lg:col-span-2 space-y-6">
            {/* Staff list card */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <UsersIcon className="size-5 text-primary" />
                    <div>
                      <CardTitle className="text-lg">Associated Staff</CardTitle>
                      <CardDescription>
                        Members of this shelter who can manage listings and adoption requests.
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    asChild
                    size="sm"
                    className="bg-[#AE8F65] text-white border-transparent hover:bg-[#9A7D58] hover:text-white cursor-pointer rounded-lg transition-colors duration-200 font-medium shadow-none shrink-0 text-xs h-8"
                  >
                    <Link href={`/shelters/${shelter.id}/staff/new`}>
                      <PlusIcon className="size-3.5" />
                      Add Staff
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {staffWithAvatars.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed rounded-lg bg-muted/10">
                    <UsersIcon className="size-10 text-muted-foreground opacity-40 mb-2" />
                    <h5 className="font-semibold text-sm">No staff members assigned yet</h5>
                    <p className="text-xs text-muted-foreground max-w-xs mt-0.5">
                      Add a staff account to start shelter operations.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {staffWithAvatars.map((staff) => (
                      <div
                        key={staff.id}
                        className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/10 transition-colors"
                      >
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
                        <Badge
                          variant={staff.isActive ? "outline" : "warning"}
                          className={staff.isActive
                            ? "text-[9px] uppercase tracking-wider font-semibold border-primary/20 bg-primary/5 text-primary shrink-0"
                            : "text-[9px] uppercase tracking-wider font-semibold shrink-0"
                          }
                        >
                          {staff.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pets list card */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <PawPrintIcon className="size-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">Shelter Pets</CardTitle>
                    <CardDescription>
                      Pets currently listed under this shelter.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {petsWithImages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed rounded-lg bg-muted/10">
                    <PawPrintIcon className="size-10 text-muted-foreground opacity-40 mb-2" />
                    <h5 className="font-semibold text-sm">No pets registered for this shelter yet</h5>
                    <p className="text-xs text-muted-foreground max-w-xs mt-0.5">
                      Shelter staff can add pets from their dashboard listings.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {petsWithImages.map((pet) => {
                      const primaryImage =
                        pet.petImages.find((img) => img.isPrimary)?.url ??
                        pet.petImages[0]?.url

                      return (
                        <Link
                          key={pet.id}
                          href={`/pets/${pet.id}`}
                          className="group block text-center space-y-1"
                        >
                          <div className="relative aspect-square rounded-lg bg-muted border overflow-hidden group-hover:ring-2 group-hover:ring-primary/30 transition-all">
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
                          <div className="text-xs font-semibold truncate px-1 text-foreground pt-1">
                            {pet.name}
                          </div>
                          <div className="text-[10px] text-muted-foreground truncate">
                            {pet.breed ?? pet.species}
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
