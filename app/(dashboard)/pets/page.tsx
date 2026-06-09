import { PlusIcon } from "lucide-react"

import { PageHeader } from "@/components/dashboard/page-header"
import { EmptyPetsState } from "@/components/pets/empty-pets-state"
import { PetFilters } from "@/components/pets/pet-filters"
import { PetGrid } from "@/components/pets/pet-grid"
import { PetManagementTabs } from "@/components/pets/pet-management-tabs"
import { PetPagination } from "@/components/pets/pet-pagination"
import { requireRole } from "@/lib/auth/require-role"
import { getPets } from "@/lib/services/pet.service"
import { parsePetListQuery, type PetListSearchParams } from "@/lib/utils/pet-list"

type PetsPageProps = {
  searchParams: Promise<PetListSearchParams>
}

export default async function PetsPage({ searchParams }: PetsPageProps) {
  const user = await requireRole(["ADMIN", "SHELTER_STAFF", "PET_OWNER", "ADOPTER"])
  const params = await searchParams
  const { filters, page, pageSize } = parsePetListQuery(params)

  const result = await getPets(
    {
      userId: user.id,
      role: user.role,
      shelterId: user.shelterId,
    },
    filters,
    page,
    pageSize
  )
  const isAdmin = user.role === "ADMIN"
  const isAdopter = user.role === "ADOPTER"
  const showManagementTabs = !isAdopter
  const isArchivedView = filters.tab === "archived"
  const hasFilters = Boolean(
    filters.species || filters.size || filters.gender || filters.search
  )
  const showEmpty = result.pets.length === 0

  return (
    <div className="flex w-full flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <PageHeader
          title={isAdmin ? "Pet Listings" : isAdopter ? "Available Pets" : "My Pet Listings"}
          subtitle={
            isAdmin
              ? "Browse and manage pets across shelters and independent owners."
              : isAdopter
                ? "Browse pets available for adoption."
                : isArchivedView
                  ? "Archived pets are hidden from public listings but remain in your records."
                  : "Manage pets posted by you or your shelter."
          }
          action={
            isAdmin || isAdopter
              ? undefined
              : {
                  label: user.role === "PET_OWNER" ? "Post a Pet" : "Add Shelter Pet",
                  href: "/pets/new",
                  icon: <PlusIcon />,
                }
          }
        />

        {showManagementTabs ? <PetManagementTabs filters={filters} /> : null}

        <PetFilters filters={filters} />

        {showEmpty ? (
          <EmptyPetsState
            variant={
              hasFilters
                ? "no-results"
                : isArchivedView
                  ? "no-pets"
                  : "no-pets"
            }
          />
        ) : (
          <>
            <PetGrid pets={result.pets} />
            <PetPagination
              filters={filters}
              page={result.page}
              totalPages={result.totalPages}
              total={result.total}
            />
          </>
        )}
      </div>
    </div>
  )
}
