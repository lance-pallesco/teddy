import { PawPrintIcon, ClipboardListIcon } from "lucide-react"

import { PageHeader } from "@/components/dashboard/page-header"
import { ApplicationTabs } from "@/components/applications/application-tabs"
import { ApplicationFilters } from "@/components/applications/application-filters"
import { ApplicationCard } from "@/components/applications/application-card"
import { EmptyState } from "@/components/shared/empty-state"
import { Pagination } from "@/components/shared/pagination"
import {
  getApplicationsByApplicant,
  getApplicationsByPetOwner,
  getPetsByOwner,
} from "@/lib/services/application.service"
import {
  parseApplicationListQuery,
  buildApplicationListHref,
  type ApplicationListSearchParams,
} from "@/lib/utils/application-list"

type ApplicationsListViewProps = {
  variant: "adopter" | "reviewer"
  searchParams: ApplicationListSearchParams
  user: {
    id: string
    role: string
    shelterId: string | null
  }
}

export async function ApplicationsListView({
  variant,
  searchParams,
  user,
}: ApplicationsListViewProps) {
  const { filters, page, pageSize } = parseApplicationListQuery(searchParams)

  const isAdopter = variant === "adopter"

  // Fetch data based on variant
  let applications: any[] = []
  let total = 0
  let totalPages = 1
  let currentPage = page
  let pets: { id: string; name: string }[] = []

  if (isAdopter) {
    const result = await getApplicationsByApplicant(
      user.id,
      filters.tab ?? "all",
      page,
      pageSize
    )
    applications = result.applications
    total = result.total
    totalPages = result.totalPages
    currentPage = result.page
  } else {
    const session = {
      userId: user.id,
      role: user.role as "SHELTER_STAFF" | "PET_OWNER" | "ADMIN",
      shelterId: user.shelterId,
    }
    const [result, ownerPets] = await Promise.all([
      getApplicationsByPetOwner(
        session,
        { status: filters.status, petId: filters.petId },
        page,
        pageSize
      ),
      getPetsByOwner(session),
    ])
    applications = result.applications
    total = result.total
    totalPages = result.totalPages
    currentPage = result.page
    pets = ownerPets
  }

  const showEmpty = applications.length === 0

  return (
    <div className="flex w-full flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <PageHeader
          title={isAdopter ? "My Applications" : "Incoming Applications"}
          subtitle={
            isAdopter
              ? "Track the status of your adoption applications."
              : "Review adoption applications submitted for your pets."
          }
        />

        {/* Filters */}
        {isAdopter ? (
          <ApplicationTabs filters={filters} />
        ) : (
          <ApplicationFilters filters={filters} pets={pets} />
        )}

        {/* Content */}
        {showEmpty ? (
          <EmptyState
            icon={isAdopter ? PawPrintIcon : ClipboardListIcon}
            title="No applications yet"
            description={
              isAdopter
                ? "You haven't applied to adopt any pets."
                : "No adoption applications have been submitted for your pets."
            }
            action={
              isAdopter
                ? {
                    label: "Browse Pets",
                    href: "/pets",
                    icon: <PawPrintIcon className="size-4" />,
                  }
                : undefined
            }
          />
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {applications.map((application: any) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  applicantName={
                    !isAdopter && application.applicant
                      ? `${application.applicant.firstName} ${application.applicant.lastName}`
                      : undefined
                  }
                />
              ))}
            </div>
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              total={total}
              itemLabel="application"
              buildHref={(p) =>
                buildApplicationListHref("/applications", filters, p)
              }
            />
          </>
        )}
      </div>
    </div>
  )
}
