import Image from "next/image"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { ShelterFormRecord } from "@/lib/services/shelter.service"

type ShelterInfoCardProps = {
  shelter: ShelterFormRecord
}

export function ShelterInfoCard({ shelter }: ShelterInfoCardProps) {
  const statusLabel = shelter.isActive ? "Active" : "Inactive"

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <div className="relative size-16 overflow-hidden rounded-md border bg-muted">
              {shelter.logo ? (
                <Image
                  src={shelter.logo}
                  alt={`${shelter.name} logo`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                  NA
                </div>
              )}
            </div>

            <div className="pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold">{shelter.name}</h2>
                <Badge
                  variant={shelter.isActive ? "success" : "warning"}
                  aria-label={`Shelter status: ${statusLabel}`}
                >
                  {statusLabel}
                </Badge>
              </div>

              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                {shelter.description}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Address
              </p>
              <p className="mt-1 text-sm">
                {shelter.address}
                {shelter.barangay ? `, ${shelter.barangay}` : ""}
                <span className="block text-muted-foreground">
                  {shelter.city}, {shelter.province}
                  {shelter.postalCode ? ` ${shelter.postalCode}` : ""}
                </span>
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Contact
              </p>
              <p className="mt-1 text-sm">
                <span className="block">
                  {shelter.email}
                </span>
                <span className="block text-muted-foreground">
                  {shelter.phone}
                </span>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

