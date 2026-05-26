import { PawPrintIcon, ScanSearchIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

type PetPlaceholder = {
  id: string
  name: string
  speciesBreed: string
  status: "Available" | "Adopted" | "In Care"
  age: string
}

const pets: PetPlaceholder[] = [
  {
    id: "p1",
    name: "Luna",
    speciesBreed: "Dog • Mixed",
    status: "Available",
    age: "2 years",
  },
  {
    id: "p2",
    name: "Milo",
    speciesBreed: "Cat • Tabby",
    status: "In Care",
    age: "8 months",
  },
  {
    id: "p3",
    name: "Bella",
    speciesBreed: "Dog • Retriever",
    status: "Available",
    age: "1 year",
  },
  {
    id: "p4",
    name: "Charlie",
    speciesBreed: "Cat • Domestic Shorthair",
    status: "Adopted",
    age: "3 years",
  },
  {
    id: "p5",
    name: "Rocky",
    speciesBreed: "Dog • Husky Mix",
    status: "Available",
    age: "6 months",
  },
  {
    id: "p6",
    name: "Daisy",
    speciesBreed: "Dog • Beagle",
    status: "In Care",
    age: "10 months",
  },
]

function badgeVariant(status: PetPlaceholder["status"]) {
  if (status === "Available") return "success"
  if (status === "Adopted") return "secondary"
  return "warning"
}

export function ShelterPetsGrid() {
  return (
    <div>
      <div className="flex items-center gap-2">
        <PawPrintIcon className="size-5 text-muted-foreground" />
        <h3 className="text-base font-medium">Pets</h3>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pets.map((pet) => (
          <Card key={pet.id}>
            <CardContent className="p-4">
              <div className="relative">
                <div className="aspect-[4/3] overflow-hidden rounded-md border bg-muted">
                  <div className="flex size-full items-center justify-center text-muted-foreground">
                    NA
                  </div>
                </div>

                <div className="mt-3 flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{pet.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {pet.speciesBreed}
                    </p>
                  </div>
                  <Badge variant={badgeVariant(pet.status)}>{pet.status}</Badge>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Age: {pet.age}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    disabled
                    aria-label="Quick actions (placeholder)"
                  >
                    <ScanSearchIcon className="size-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

