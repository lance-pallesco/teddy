import Image from "next/image"
import { BadgeCheckIcon, Building2Icon, MailIcon, MapPinIcon, PhoneIcon } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { PetDetail } from "@/lib/services/pet.service"

type PetAttributionCardProps = {
  pet: Pick<PetDetail, "shelter" | "postedBy" | "location">
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function PetAttributionCard({ pet }: PetAttributionCardProps) {
  if (pet.shelter) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Listed by shelter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border bg-muted">
              {pet.shelter.logo ? (
                <Image
                  src={pet.shelter.logo}
                  alt=""
                  fill
                  className="object-cover"
                  unoptimized={pet.shelter.logo.startsWith("/uploads/")}
                />
              ) : (
                <div className="flex size-full items-center justify-center">
                  <Building2Icon className="size-5 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold">{pet.shelter.name}</p>
                {pet.shelter.isActive ? (
                  <Badge variant="secondary" className="gap-1">
                    <BadgeCheckIcon className="size-3" />
                    Verified
                  </Badge>
                ) : null}
              </div>
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPinIcon className="size-3.5 shrink-0" />
                {pet.location}
              </p>
            </div>
          </div>
          <div className="space-y-1.5 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <MailIcon className="size-3.5 shrink-0" />
              <a href={`mailto:${pet.shelter.email}`} className="hover:text-foreground hover:underline">
                {pet.shelter.email}
              </a>
            </p>
            <p className="flex items-center gap-2">
              <PhoneIcon className="size-3.5 shrink-0" />
              <a href={`tel:${pet.shelter.phone}`} className="hover:text-foreground hover:underline">
                {pet.shelter.phone}
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (pet.postedBy) {
    const owner = pet.postedBy

    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Listed by owner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Avatar size="lg">
              {owner.avatar ? <AvatarImage src={owner.avatar} alt="" /> : null}
              <AvatarFallback>{getInitials(owner.firstName, owner.lastName)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-semibold">
                {owner.firstName} {owner.lastName}
              </p>
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPinIcon className="size-3.5 shrink-0" />
                {pet.location}
              </p>
            </div>
          </div>
          <div className="space-y-1.5 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <MailIcon className="size-3.5 shrink-0" />
              <a href={`mailto:${owner.email}`} className="hover:text-foreground hover:underline">
                {owner.email}
              </a>
            </p>
            <p className="flex items-center gap-2">
              <PhoneIcon className="size-3.5 shrink-0" />
              <a href={`tel:${owner.phone}`} className="hover:text-foreground hover:underline">
                {owner.phone}
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}
