import { redirect, notFound } from "next/navigation"

import { getCurrentUser } from "@/lib/auth/session"
import { getApplicationDetail } from "@/lib/services/application.service"
import { ApplicationDetailContent } from "@/components/applications/application-detail-content"
import { SetBreadcrumbLabel } from "@/components/dashboard/breadcrumb-context"

type ApplicationDetailPageProps = {
  params: Promise<{ id: string }>
}

export default async function ApplicationDetailPage({
  params,
}: ApplicationDetailPageProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const { id } = await params
  const application = await getApplicationDetail(id)

  if (!application) {
    notFound()
  }

  // --- Authorization checks ---
  const role = user.role

  if (role === "ADOPTER") {
    // Adopter can only view their own applications
    if (application.applicantId !== user.id) {
      redirect("/applications")
    }
  } else if (role === "SHELTER_STAFF") {
    // Staff can only view applications for their shelter's pets
    if (application.pet.shelterId !== user.shelterId) {
      redirect("/applications")
    }
  } else if (role === "PET_OWNER") {
    // Pet owner can only view applications for their own pets
    if (application.pet.postedById !== user.id) {
      redirect("/applications")
    }
  } else if (role === "ADMIN") {
    // Admin has unrestricted access
  } else {
    redirect("/unauthorized")
  }

  return (
    <>
      <SetBreadcrumbLabel segment={id} label={application.pet.name} />
      <ApplicationDetailContent
        application={application}
        userRole={role}
      />
    </>
  )
}
