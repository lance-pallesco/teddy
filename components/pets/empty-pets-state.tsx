import Link from "next/link"
import { HeartHandshakeIcon, PawPrintIcon, PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

type EmptyPetsStateProps = {
  variant: "no-pets" | "no-results"
}

export function EmptyPetsState({ variant }: EmptyPetsStateProps) {
  const isFiltered = variant === "no-results"

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        {isFiltered ? (
          <PawPrintIcon className="size-7" />
        ) : (
          <HeartHandshakeIcon className="size-7" />
        )}
      </div>
      <h2 className="mt-5 text-lg font-semibold">
        {isFiltered ? "No pets match your filters" : "No pet listings yet"}
      </h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {isFiltered
          ? "Try adjusting species, size, gender, or your search terms to discover more listings."
          : "Share a pet’s story with photos and details. Your first listing helps adopters find their next companion."}
      </p>
      <Button asChild className="mt-6" size="lg">
        <Link href={isFiltered ? "/pets" : "/pets/new"}>
          {isFiltered ? (
            <>Clear filters</>
          ) : (
            <>
              <PlusIcon />
              Add your first pet
            </>
          )}
        </Link>
      </Button>
    </div>
  )
}
