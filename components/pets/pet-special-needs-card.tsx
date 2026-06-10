import { HeartHandshakeIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { PetDetail } from "@/lib/services/pet.service"

type PetSpecialNeedsCardProps = {
  pet: Pick<PetDetail, "specialNeeds" | "specialNeedsNote">
}

export function PetSpecialNeedsCard({ pet }: PetSpecialNeedsCardProps) {
  if (!pet.specialNeeds) {
    return null
  }

  return (
    <Card className="border-amber-500/30 bg-amber-500/5">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <HeartHandshakeIcon className="size-5 text-amber-600 dark:text-amber-400" />
          <CardTitle className="text-base">Special care needs</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {pet.specialNeedsNote?.trim() ||
            "This pet has special care needs. Please contact the poster for more information."}
        </p>
      </CardContent>
    </Card>
  )
}
