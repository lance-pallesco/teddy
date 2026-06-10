import { PetGrid } from "@/components/pets/pet-grid"
import type { PetListItem } from "@/lib/services/pet.service"

type RelatedPetsProps = {
  pets: PetListItem[]
  title?: string
}

export function RelatedPets({
  pets,
  title = "You might also like",
}: RelatedPetsProps) {
  if (pets.length === 0) {
    return null
  }

  return (
    <section className="space-y-4 border-t pt-8">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          More companions from the same shelter or species.
        </p>
      </div>
      <PetGrid pets={pets} />
    </section>
  )
}
