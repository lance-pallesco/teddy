import { PetCard } from "@/components/pets/pet-card"
import type { PetListItem } from "@/lib/services/pet.service"

type PetGridProps = {
  pets: PetListItem[]
}

export function PetGrid({ pets }: PetGridProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {pets.map((pet) => (
        <PetCard key={pet.id} pet={pet} />
      ))}
    </div>
  )
}
