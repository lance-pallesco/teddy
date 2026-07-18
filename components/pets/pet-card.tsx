import Image from "next/image"
import Link from "next/link"
import { BadgeCheckIcon, Heart, MapPinIcon, PawPrintIcon, User2 } from "lucide-react"

import { PetStatusBadge } from "@/components/pets/pet-status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { PetListItem } from "@/lib/services/pet.service"
import type { PetStatus } from "@prisma/client"
import { cn } from "@/lib/utils"

type PetCardProps = {
  pet: PetListItem
  className?: string
}

export function PetCard({ pet, className }: PetCardProps) {
  return (
    <Card
      className={cn(
        "group overflow-hidden transition-shadow hover:shadow-md ",
        className
      )}
    >
      <CardContent className="p-0 bg-white">
        <Link href={`/pets/${pet.id}`} className="block">
          <div className="relative aspect-[4/3] overflow-hidden bg-muted">
            {pet.primaryImageUrl ? (
              <Image
                src={pet.primaryImageUrl}
                alt={pet.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                unoptimized={pet.primaryImageUrl.startsWith("/uploads/")}
              />
            ) : (
              <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
                <PawPrintIcon className="size-10 opacity-60" />
                <span className="text-xs">No photo yet</span>
              </div>
            )}
          </div>

          <div className="space-y-2.5 p-3.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-lg font-medium leading-tight">{pet.name}</p>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">
                  {pet.speciesBreed}
                </p>
              </div>
              <PetStatusBadge status={pet.status as PetStatus} className="shrink-0" />
            </div>

            <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span>Age: {pet.ageLabel}</span>
              <span>Size: {pet.sizeLabel}</span>
            </div>

            <div className="flex items-center gap-1.5 text-sm">
              {pet.attribution.isShelter && pet.attribution.isVerified ? (
                <BadgeCheckIcon className="size-4 shrink-0 text-primary" aria-hidden />
              ) : <User2 className="size-3.5 shrink-0" aria-hidden />}
              <span className="truncate text-foreground">
                {pet.attribution.label}
              </span>
              {pet.attribution.isShelter ? (
                <span className="shrink-0 text-xs text-muted-foreground">(Shelter)</span>
              ) : (
                <span className="shrink-0 text-xs text-muted-foreground">(Owner)</span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPinIcon className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate">{pet.location}</span>
            </div>
          </div>
        </Link>

        <div className="border-t px-3.5 py-3.5">
          <Button variant="outline" className="w-full rounded-lg bg-[#AE8F65] text-white border-transparent hover:bg-[#9A7D58] hover:text-white hover:border-[#9A7D58] text-sm font-medium  transition-colors duration-200 cursor-pointer shadow-none" asChild>
            <Link href={`/pets/${pet.id}`}>
              <Heart />
              Meet {pet.name}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
