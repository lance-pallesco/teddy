import Link from "next/link"
import Image from "next/image"
import { CalendarIcon, BuildingIcon, UserIcon, PawPrintIcon } from "lucide-react"
import type { AdoptionStatus } from "@prisma/client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ApplicationStatusBadge } from "@/components/applications/application-status-badge"
import { cn } from "@/lib/utils"

type ApplicationCardProps = {
  application: {
    id: string
    status: AdoptionStatus
    submittedAt: Date | null
    createdAt: Date
    applicant?: {
      firstName: string
      lastName: string
      avatar: string
    } | null
    pet: {
      id: string
      name: string
      primaryImageUrl: string | null
      postedBy: { firstName: string; lastName: string } | null
      shelter: { name: string } | null
    }
  }
  /** If provided, displays the applicant name on the card (reviewer variant) */
  applicantName?: string
}

function formatDate(date: Date | null): string {
  if (!date) return "—"
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

export function ApplicationCard({ application, applicantName }: ApplicationCardProps) {
  const { pet, applicant } = application
  const attribution = pet.shelter
    ? pet.shelter.name
    : pet.postedBy
      ? `${pet.postedBy.firstName} ${pet.postedBy.lastName}`
      : "Unknown"
  const isShelter = !!pet.shelter

  const isReviewer = !!applicantName

  return (
    <Card className="overflow-hidden border border-primary/10 transition-all hover:shadow-xs hover:border-primary/20 bg-white">
      <CardContent className="p-4">
        {isReviewer ? (
          /* Reviewer Row Layout (Focuses on Adopter / Applicant) */
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">

            {/* 1. Applicant/Adopter Info */}
            <div className="md:col-span-3 flex items-center gap-3 min-w-0">
              <div className="relative size-10 rounded-full bg-muted border overflow-hidden shrink-0">
                {applicant?.avatar ? (
                  <Image
                    src={applicant.avatar}
                    alt={applicantName || "Adopter"}
                    fill
                    className="object-cover"
                    sizes="40px"
                    unoptimized={applicant.avatar.startsWith("/uploads/")}
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-muted-foreground bg-primary/5 text-primary text-xs font-bold">
                    {applicant?.firstName?.[0] || "A"}
                    {applicant?.lastName?.[0] || ""}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <span className="block text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-none mb-1">
                  Applicant
                </span>
                <h4 className="text-sm text-foreground truncate leading-tight">
                  {applicantName}
                </h4>
              </div>
            </div>

            {/* 2. Pet Info (Small image and name) */}
            <div className="md:col-span-2 flex items-center gap-2.5 min-w-0">
              <div className="relative size-9 rounded-lg border bg-muted overflow-hidden shrink-0">
                {pet.primaryImageUrl ? (
                  <Image
                    src={pet.primaryImageUrl}
                    alt={pet.name}
                    fill
                    className="object-cover"
                    sizes="36px"
                    unoptimized={pet.primaryImageUrl.startsWith("/uploads/")}
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-muted/40 text-muted-foreground">
                    <PawPrintIcon className="size-4 opacity-40" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <span className="block text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-none mb-1">
                  Adopting Pet
                </span>
                <h4 className="font-normal text-sm text-foreground truncate leading-tight">
                  {pet.name}
                </h4>
              </div>
            </div>

            {/* 3. Attribution */}
            <div className="md:col-span-2 min-w-0">
              <span className="block text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-none mb-1">
                Shelter / Owner
              </span>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
                {isShelter ? (
                  <BuildingIcon className="size-3.5 shrink-0 text-muted-foreground/60" />
                ) : (
                  <UserIcon className="size-3.5 shrink-0 text-muted-foreground/60" />
                )}
                <span className="truncate">{attribution}</span>
              </div>
            </div>

            {/* 4. Submission Date */}
            <div className="md:col-span-2 min-w-0">
              <span className="block text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-none mb-1">
                Submitted
              </span>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarIcon className="size-3.5 shrink-0 text-muted-foreground/60" />
                <span className="truncate">
                  {formatDate(application.submittedAt || application.createdAt)}
                </span>
              </div>
            </div>

            {/* 5. Status Badge */}
            <div className="md:col-span-2 flex items-center md:justify-start">
              <ApplicationStatusBadge status={application.status} />
            </div>

            {/* 6. Action Button */}
            <div className="md:col-span-1 flex md:justify-end">
              <Button asChild size="sm" variant="default" className="w-full md:w-auto min-w-20 bg-[#AE8F65] text-white hover:bg-[#9A7D58] hover:text-white rounded-lg">
                <Link href={`/applications/${application.id}`}>
                  Review
                </Link>
              </Button>
            </div>

          </div>
        ) : (
          /* Adopter Row Layout (Focuses on Pet being adopted) */
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">

            {/* 1. Pet Thumbnail & Name */}
            <div className="md:col-span-4 flex items-center gap-3.5 min-w-0">
              <div className="relative size-12 rounded-xl border bg-muted overflow-hidden shrink-0">
                {pet.primaryImageUrl ? (
                  <Image
                    src={pet.primaryImageUrl}
                    alt={pet.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                    unoptimized={pet.primaryImageUrl.startsWith("/uploads/")}
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-muted/40 text-muted-foreground">
                    <PawPrintIcon className="size-6 opacity-40" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <span className="block text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-none mb-1">
                  Pet Details
                </span>
                <h4 className="font-bold text-base text-foreground truncate leading-none">
                  {pet.name}
                </h4>
              </div>
            </div>

            {/* 2. Attribution */}
            <div className="md:col-span-2 min-w-0">
              <span className="block text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-none mb-1">
                Shelter / Owner
              </span>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
                {isShelter ? (
                  <BuildingIcon className="size-3.5 shrink-0 text-muted-foreground/60" />
                ) : (
                  <UserIcon className="size-3.5 shrink-0 text-muted-foreground/60" />
                )}
                <span className="truncate">{attribution}</span>
              </div>
            </div>

            {/* 3. Submission Date */}
            <div className="md:col-span-3 min-w-0">
              <span className="block text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-none mb-1">
                Submitted
              </span>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarIcon className="size-3.5 shrink-0 text-muted-foreground/60" />
                <span className="truncate">
                  {formatDate(application.submittedAt || application.createdAt)}
                </span>
              </div>
            </div>

            {/* 4. Status Badge */}
            <div className="md:col-span-2 flex items-center md:justify-start">
              <ApplicationStatusBadge status={application.status} />
            </div>

            {/* 5. Action Button */}
            <div className="md:col-span-1 flex md:justify-end">
              <Button asChild size="sm" variant="outline" className="w-full md:w-auto rounded-lg">
                <Link href={`/applications/${application.id}`}>
                  View
                </Link>
              </Button>
            </div>

          </div>
        )}
      </CardContent>
    </Card>
  )
}
