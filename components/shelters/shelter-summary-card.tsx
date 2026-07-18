import Image from "next/image"
import Link from "next/link"
import {
  Building2Icon,
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  PencilIcon,
  InfoIcon,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShelterStatusActions } from "@/components/shelters/shelter-status-actions"
import type { ShelterFormRecord } from "@/lib/services/shelter.service"

type ShelterSummaryCardProps =
  | {
      variant: "view"
      shelter: ShelterFormRecord
      stats?: { petsCount: number; staffCount: number }
    }
  | {
      variant: "preview"
      shelter: ShelterFormRecord
      stats?: { petsCount: number; staffCount: number }
    }
  | {
      variant: "new"
      shelter?: undefined
      stats?: undefined
    }

export function ShelterSummaryCard(props: ShelterSummaryCardProps) {
  const { variant, shelter, stats } = props

  if (variant === "new") {
    return (
      <Card className="lg:sticky lg:top-6 border-primary/15 bg-muted/20 overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
            New Shelter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted border flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Building2Icon className="size-10 opacity-60" />
            <span className="text-xs">Shelter Preview</span>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold tracking-tight text-foreground/60">
              Create a Shelter
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground text-justify">
              Fill out the form to register a new shelter profile. Once created,
              you can assign staff members and begin managing pet listings.
            </p>
          </div>
          <div className="space-y-2 border-t pt-3">
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <InfoIcon className="size-3.5 text-primary shrink-0 mt-0.5" />
              <span>All fields marked as required must be completed before submitting.</span>
            </div>
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <InfoIcon className="size-3.5 text-primary shrink-0 mt-0.5" />
              <span>You can upload a logo now or add one later from the edit page.</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
  const statusLabel = shelter.isActive ? "Active" : "Inactive"

  return (
    <Card className="lg:sticky lg:top-6 border-primary/15 bg-muted/20 overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
          {variant === "view" ? "Shelter Profile" : "Current Details"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xl font-bold tracking-tight">{shelter.name}</h3>
            <Badge variant={shelter.isActive ? "success" : "secondary"}>
              {statusLabel}
            </Badge>
          </div>

          {shelter.description && (
            <p className="text-sm leading-relaxed text-muted-foreground text-justify">
              {shelter.description}
            </p>
          )}

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

        {stats && (
          <div className="grid grid-cols-2 gap-2 border-t pt-3 text-center">
            <div className="rounded-lg bg-background p-2 border">
              <p className="text-lg font-bold text-foreground">{stats.petsCount}</p>
              <p className="text-[10px] uppercase font-semibold text-muted-foreground">
                Pets Listed
              </p>
            </div>
            <div className="rounded-lg bg-background p-2 border">
              <p className="text-lg font-bold text-foreground">{stats.staffCount}</p>
              <p className="text-[10px] uppercase font-semibold text-muted-foreground">
                Staff Members
              </p>
            </div>
          </div>
        )}
        {variant === "view" && (
          <div className="space-y-2 border-t pt-3">
            <Button
              asChild
              size="sm"
              variant="outline"
              className="w-full rounded-lg border-transparent text-[#AE8F65] bg-[#AE8F65]/10 hover:bg-[#AE8F65]/20 hover:text-[#AE8F65] font-medium shadow-none cursor-pointer text-xs h-8"
            >
              <Link href={`/shelters/${shelter.id}/edit`} className="gap-1.5 justify-center w-full">
                <PencilIcon className="size-3.5" />
                Edit Shelter
              </Link>
            </Button>
            <ShelterStatusActions
              shelterId={shelter.id}
              isActive={shelter.isActive}
              size="sm"
              className="rounded-lg shadow-none font-medium h-8 text-xs cursor-pointer w-full justify-center"
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
