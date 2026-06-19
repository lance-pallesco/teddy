import { redirect } from "next/navigation"
import { Suspense } from "react"

import { getCurrentUser } from "@/lib/auth/session"
import { ApplicationsListView } from "@/components/applications/applications-list-view"
import { ApplicationsToastHandler } from "./applications-toast-handler.client"

type ApplicationsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ApplicationsPage({
  searchParams,
}: ApplicationsPageProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const params = await searchParams

  const isAdopter = user.role === "ADOPTER"
  const isReviewer =
    user.role === "SHELTER_STAFF" ||
    user.role === "PET_OWNER" ||
    user.role === "ADMIN"

  if (!isAdopter && !isReviewer) {
    redirect("/unauthorized")
  }

  return (
    <>
      <Suspense fallback={null}>
        <ApplicationsToastHandler />
      </Suspense>
      <ApplicationsListView
        variant={isAdopter ? "adopter" : "reviewer"}
        searchParams={params}
        user={{
          id: user.id,
          role: user.role,
          shelterId: user.shelterId,
        }}
      />
    </>
  )
}
