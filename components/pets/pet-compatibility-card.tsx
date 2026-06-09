import {
  BabyIcon,
  CatIcon,
  CheckIcon,
  DogIcon,
  HomeIcon,
  XIcon,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { PetDetail } from "@/lib/services/pet.service"

type PetCompatibilityCardProps = {
  pet: Pick<
    PetDetail,
    "goodWithKids" | "goodWithDogs" | "goodWithCats" | "isHouseTrained"
  >
}

type CompatibilityItem = {
  label: string
  positive: boolean
  icon: typeof DogIcon
}

function CompatibilityRow({ label, positive, icon: Icon }: CompatibilityItem) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border px-3 py-2.5",
        positive
          ? "border-emerald-500/25 bg-emerald-500/5"
          : "border-border bg-muted/30"
      )}
    >
      <div
        className={cn(
          "flex size-8 items-center justify-center rounded-full",
          positive ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="size-4" aria-hidden />
      </div>
      <span className="flex-1 text-sm font-medium">{label}</span>
      {positive ? (
        <CheckIcon className="size-4 text-emerald-600 dark:text-emerald-400" aria-label="Yes" />
      ) : (
        <XIcon className="size-4 text-muted-foreground" aria-label="No" />
      )}
    </div>
  )
}

export function PetCompatibilityCard({ pet }: PetCompatibilityCardProps) {
  const items: CompatibilityItem[] = [
    { label: "Good with kids", positive: pet.goodWithKids, icon: BabyIcon },
    { label: "Good with dogs", positive: pet.goodWithDogs, icon: DogIcon },
    { label: "Good with cats", positive: pet.goodWithCats, icon: CatIcon },
    { label: "House trained", positive: pet.isHouseTrained, icon: HomeIcon },
  ]

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Compatibility</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <CompatibilityRow key={item.label} {...item} />
        ))}
      </CardContent>
    </Card>
  )
}
