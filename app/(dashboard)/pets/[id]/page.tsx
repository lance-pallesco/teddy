import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"

import { PetDetailContent } from "@/components/pets/pet-detail-content"
import { RelatedPets } from "@/components/pets/related-pets"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/auth/session"
import { getPetById, getRelatedPets } from "@/lib/services/pet.service"
import { SetBreadcrumbLabel } from "@/components/dashboard/breadcrumb-context"

type PetDetailPageProps = {
  params: Promise<{ id: string }>
}

export default async function PetDetailPage({ params }: PetDetailPageProps) {
  const { id } = await params
  const [pet, user] = await Promise.all([getPetById(id), getCurrentUser()])

  if (!pet) {
    notFound()
  }

  const relatedPets = await getRelatedPets(
    { id: pet.id, shelterId: pet.shelterId, species: pet.species },
    4
  )

  const viewer = user
    ? {
        id: user.id,
        role: user.role,
        shelterId: user.shelterId,
      }
    : null

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <SetBreadcrumbLabel segment={id} label={pet.name} />
      <div className="mx-auto w-full max-w-7xl px-12 space-y-8">
        <Button variant="ghost" size="sm" className="-ml-2 w-fit" asChild>
          <Link href={user ? "/pets" : "/"}>
            <ArrowLeftIcon />
            Back to listings
          </Link>
        </Button>

        <PetDetailContent pet={pet} viewer={viewer} />

        <RelatedPets pets={relatedPets} />
      </div>
    </div>
  )
}
