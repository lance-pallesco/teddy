import Link from "next/link"
import Image from "next/image"
import { CalendarIcon, BuildingIcon, UserIcon, PawPrintIcon } from "lucide-react"
import type { AdoptionStatus } from "@prisma/client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ApplicationStatusBadge } from "@/components/applications/application-status-badge"

type ApplicationCardProps = {
  application: {
    id: string
    status: AdoptionStatus
    submittedAt: Date | null
    createdAt: Date
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
  const { pet } = application
  const attribution = pet.shelter
    ? pet.shelter.name
    : pet.postedBy
      ? `${pet.postedBy.firstName} ${pet.postedBy.lastName}`
      : "Unknown"
  const isShelter = !!pet.shelter

  return (
    <Card className="overflow-hidden border border-primary/10 transition-shadow hover:shadow-md">
      <CardContent className="flex h-full flex-col p-0">
        {/* Pet Image Header */}
        <div className="relative aspect-[16/9] w-full border-b bg-muted">
          {pet.primaryImageUrl ? (
            <Image
              src={pet.primaryImageUrl}
              alt={pet.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
              unoptimized={pet.primaryImageUrl.startsWith("/uploads/")}
            />
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-2 bg-muted/40 text-muted-foreground">
              <PawPrintIcon className="size-8 opacity-40" />
              <span className="text-xs">No photo</span>
            </div>
          )}
          <div className="absolute right-2 top-2">
            <ApplicationStatusBadge status={application.status} />
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col justify-between space-y-3 p-4">
          <div className="space-y-2">
            <h3 className="truncate text-lg font-bold text-foreground">
              {pet.name}
            </h3>

            {/* Applicant name for reviewer variant */}
            {applicantName ? (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <UserIcon className="size-3.5 shrink-0" />
                <span className="truncate font-medium text-foreground/80">{applicantName}</span>
              </div>
            ) : null}

            {/* Attribution */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {isShelter ? (
                <BuildingIcon className="size-3.5 shrink-0" />
              ) : (
                <UserIcon className="size-3.5 shrink-0" />
              )}
              <span className="truncate">{attribution}</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarIcon className="size-3.5 shrink-0" />
              <span>
                {application.submittedAt
                  ? `Submitted ${formatDate(application.submittedAt)}`
                  : `Created ${formatDate(application.createdAt)}`}
              </span>
            </div>
          </div>

          {/* Action */}
          <div className="border-t pt-3">
            <Button asChild size="sm" variant="outline" className="w-full">
              <Link href={`/applications/${application.id}`}>
                {applicantName ? "Review" : "View Application"}
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
