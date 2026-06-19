import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeftIcon,
  BotIcon,
  CalendarCheckIcon,
  MessageCircleIcon,
  PawPrintIcon,
  Building2Icon,
  User2Icon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  BriefcaseIcon,
  XCircleIcon,
} from "lucide-react"
import type { AdoptionStatus } from "@prisma/client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ApplicationStatusBadge } from "@/components/applications/application-status-badge"
import { ApplicationTimeline } from "@/components/applications/application-timeline"
import { ApplicationFormSections } from "@/components/applications/application-form-sections"
import { PET_SPECIES_LABELS, PET_GENDER_LABELS } from "@/lib/constants/pet"
import type { PetSpecies, PetGender } from "@prisma/client"

// ---------- Types ----------

type ApplicationDetailData = {
  id: string
  status: AdoptionStatus
  createdAt: Date
  submittedAt: Date | null
  reviewedAt: Date | null
  reviewNotes: string | null
  rejectionReason: string | null
  signatureUrl: string | null
  livingEnvironment: any
  householdLifestyle: any
  petExperience: any
  adoptionCommitment: any
  agreements: any
  applicant: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    avatar: string
    occupation: string | null
    dateOfBirth: Date | null
  }
  pet: {
    id: string
    name: string
    species: PetSpecies
    breed: string | null
    gender: PetGender | null
    size: string
    status: string
    petImages: { id: string; url: string; isPrimary: boolean }[]
    shelter: {
      id: string
      name: string
      city: string
      province: string
    } | null
    postedBy: {
      id: string
      firstName: string
      lastName: string
    } | null
  }
  documents: {
    id: string
    type: any
    idType: any
    name: string
    url: string
  }[]
  reviewedBy: {
    firstName: string
    lastName: string
  } | null
}

type ApplicationDetailContentProps = {
  application: ApplicationDetailData
  userRole: string
}

// ---------- Component ----------

export function ApplicationDetailContent({
  application,
  userRole,
}: ApplicationDetailContentProps) {
  const { pet, applicant } = application
  const isAdopter = userRole === "ADOPTER"
  const isReviewer = ["SHELTER_STAFF", "PET_OWNER", "ADMIN"].includes(userRole)
  const canWithdraw = isAdopter && application.status === "PENDING"

  const primaryImage =
    pet.petImages.find((img) => img.isPrimary)?.url ?? pet.petImages[0]?.url ?? null
  const speciesLabel = PET_SPECIES_LABELS[pet.species]
  const genderLabel = pet.gender ? PET_GENDER_LABELS[pet.gender] : "Unknown"
  const breedLabel = pet.breed?.trim() || "Mixed breed"
  const attributionLabel = pet.shelter
    ? pet.shelter.name
    : pet.postedBy
      ? `${pet.postedBy.firstName} ${pet.postedBy.lastName}`
      : "Private Poster"

  return (
    <div className="flex w-full flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="mx-auto w-full max-w-7xl">
        {/* Back + Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href="/applications">
                <ArrowLeftIcon className="size-4" />
                Back
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">
                  {isAdopter ? `Application for ${pet.name}` : `${applicant.firstName}'s Application`}
                </h1>
                <ApplicationStatusBadge status={application.status} />
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {isAdopter
                  ? "Review your submitted application details."
                  : `Adoption application for ${pet.name}`}
              </p>
            </div>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Left column — Main content */}
          <div className="space-y-6">
            {/* Timeline */}
            <ApplicationTimeline
              applicationStatus={application.status}
              createdAt={application.createdAt}
              submittedAt={application.submittedAt}
              reviewedAt={application.reviewedAt}
            />

            {/* Review notes / rejection reason */}
            {application.rejectionReason ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                <h3 className="text-sm font-semibold text-destructive">Rejection Reason</h3>
                <p className="mt-1 text-sm text-foreground">{application.rejectionReason}</p>
              </div>
            ) : null}

            {application.reviewNotes && !application.rejectionReason ? (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
                <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-400">Review Notes</h3>
                <p className="mt-1 text-sm text-foreground">{application.reviewNotes}</p>
              </div>
            ) : null}

            {/* Form data sections */}
            <ApplicationFormSections
              data={{
                applicant,
                livingEnvironment: application.livingEnvironment,
                householdLifestyle: application.householdLifestyle,
                petExperience: application.petExperience,
                adoptionCommitment: application.adoptionCommitment,
                agreements: application.agreements,
                signatureUrl: application.signatureUrl,
                documents: application.documents,
              }}
            />
          </div>

          {/* Right column — Sidebar */}
          <div className="space-y-5 lg:sticky lg:top-6 lg:self-start">
            {/* Pet Info Card */}
            <Card className="overflow-hidden border-primary/15 bg-muted/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Pet Applied For
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border bg-muted">
                  {primaryImage ? (
                    <Image
                      src={primaryImage}
                      alt={pet.name}
                      fill
                      className="object-cover"
                      sizes="380px"
                      unoptimized={primaryImage.startsWith("/uploads/")}
                    />
                  ) : (
                    <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
                      <PawPrintIcon className="size-10 opacity-60" />
                      <span className="text-xs">No photo</span>
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold tracking-tight">{pet.name}</h3>
                  <p className="text-sm font-medium text-foreground/80">
                    {speciesLabel} • {breedLabel}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 pt-1 text-xs text-muted-foreground">
                    <span><strong>Gender:</strong> {genderLabel}</span>
                    <span><strong>Size:</strong> {pet.size.toLowerCase().replace("_", " ")}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 border-t pt-3 text-sm text-foreground/90">
                  {pet.shelter ? (
                    <Building2Icon className="size-4 shrink-0 text-primary" />
                  ) : (
                    <User2Icon className="size-4 shrink-0 text-primary" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{attributionLabel}</p>
                    <p className="text-xs text-muted-foreground">
                      {pet.shelter ? `${pet.shelter.city}, ${pet.shelter.province}` : "Individual Foster"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Applicant Info Card (for reviewers) */}
            {isReviewer ? (
              <Card className="border-primary/15 bg-muted/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Applicant
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="relative size-12 overflow-hidden rounded-full border bg-muted">
                      <Image
                        src={applicant.avatar}
                        alt={`${applicant.firstName} ${applicant.lastName}`}
                        fill
                        className="object-cover"
                        unoptimized={applicant.avatar.startsWith("/uploads/")}
                      />
                    </div>
                    <div>
                      <p className="font-semibold">
                        {applicant.firstName} {applicant.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">Adoption Applicant</p>
                    </div>
                  </div>
                  <div className="space-y-2 border-t pt-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MailIcon className="size-3.5 shrink-0" />
                      <span className="truncate">{applicant.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <PhoneIcon className="size-3.5 shrink-0" />
                      <span>{applicant.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPinIcon className="size-3.5 shrink-0" />
                      <span className="truncate">{applicant.address}</span>
                    </div>
                    {applicant.occupation ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <BriefcaseIcon className="size-3.5 shrink-0" />
                        <span>{applicant.occupation}</span>
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* Action Buttons */}
            <Card className="border-primary/15">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {isAdopter ? (
                  <Button
                    variant="destructive"
                    className="w-full"
                    size="sm"
                    disabled={!canWithdraw}
                    title={
                      canWithdraw
                        ? "Withdraw this application"
                        : "You can only withdraw pending applications"
                    }
                  >
                    <XCircleIcon className="size-4" />
                    Withdraw Application
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" className="w-full" size="sm" disabled>
                      <BotIcon className="size-4" />
                      Ask TeddyAI
                    </Button>
                    <Button variant="outline" className="w-full" size="sm" disabled>
                      <CalendarCheckIcon className="size-4" />
                      Schedule Interview
                    </Button>
                    <Button variant="outline" className="w-full" size="sm" disabled>
                      <MessageCircleIcon className="size-4" />
                      Chat with Adopter
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
