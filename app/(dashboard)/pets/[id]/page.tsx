import Link from "next/link"

import { Button } from "@/components/ui/button"
import { requireRole } from "@/lib/auth/require-role"

type PetDetailPageProps = {
  params: Promise<{ id: string }>
}

export default async function PetDetailPage({ params }: PetDetailPageProps) {
  await requireRole(["SHELTER_STAFF", "PET_OWNER", "ADMIN", "ADOPTER"])
  const { id } = await params

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="mx-auto w-full max-w-2xl rounded-lg border p-8 text-center">
        <h1 className="text-xl font-semibold">Pet details</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Detail view for pet <span className="font-mono text-xs">{id}</span> is coming in a
          future release.
        </p>
        <Button asChild className="mt-6" variant="outline">
          <Link href="/pets">Back to listings</Link>
        </Button>
      </div>
    </div>
  )
}
