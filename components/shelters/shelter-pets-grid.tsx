import { PawPrintIcon } from "lucide-react"

import { PetGrid } from "@/components/pets/pet-grid"
import { getShelterPets } from "@/lib/services/pet.service"

type ShelterPetsGridProps = {
  shelterId: string
}

export async function ShelterPetsGrid({ shelterId }: ShelterPetsGridProps) {
  const { pets, total } = await getShelterPets(shelterId)

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <PawPrintIcon className="size-5 text-muted-foreground" />
          <h3 className="text-base font-medium">Pets</h3>
          <span className="text-sm text-muted-foreground">({total})</span>
        </div>
      </div>

      {pets.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed p-10 text-center">
          <p className="font-medium">No pets registered for this shelter yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Shelter staff can add pets from their dashboard listings.
          </p>
        </div>
      ) : (
        <div className="mt-4">
          <PetGrid pets={pets} />
        </div>
      )}
    </div>
  )
}
