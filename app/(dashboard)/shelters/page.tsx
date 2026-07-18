import Link from "next/link"
import { PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SheltersClient } from "@/components/shelters/shelters-client"
import { requireRole } from "@/lib/auth/require-role"
import { prisma } from "@/lib/prisma"

export default async function SheltersPage() {
  // 1. Enforce ADMIN access
  await requireRole(["ADMIN"])

  // 2. Fetch shelters with staff and pet counts
  const shelters = await prisma.shelter.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      city: true,
      province: true,
      phone: true,
      email: true,
      isActive: true,
      createdAt: true,
      _count: {
        select: {
          users: true,
          pets: true,
        },
      },
    },
  })

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:px-16 md:py-6 w-full max-w-full min-w-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#3D3C3A]">Shelters</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage shelter records and prepare them for future staff assignment.
          </p>
        </div>
        <Button
          variant="outline"
          size="lg"
          className="bg-[#AE8F65] text-white border-transparent hover:bg-[#9A7D58] hover:text-white cursor-pointer rounded-lg transition-colors duration-200 font-medium shadow-none shrink-0"
          asChild
        >
          <Link href="/shelters/new">
            <PlusIcon />
            <span>Add Shelter</span>
          </Link>
        </Button>
      </div>

      <SheltersClient initialShelters={shelters} />
    </div>
  )
}
