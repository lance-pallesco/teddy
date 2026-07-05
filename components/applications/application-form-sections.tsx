"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import type { AdoptionStatus, ApplicationDocumentType, GovernmentIDType } from "@prisma/client"
import { DownloadIcon, FileTextIcon, EyeIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  HOUSING_TYPE_LABELS,
  OWNERSHIP_STATUS_LABELS,
  LANDLORD_ALLOWS_PETS_LABELS,
  PROPERTY_SIZE_LABELS,
  PET_ALONE_TIME_LABELS,
  CARE_WHEN_AWAY_LABELS,
  PET_PRIMARY_LOCATION_LABELS,
  PET_SLEEP_LOCATION_LABELS,
  PRIMARY_CAREGIVER_LABELS,
  EXPERIENCE_WITH_SPECIES_LABELS,
  HEARD_ABOUT_PET_FROM_LABELS,
  GOVERNMENT_ID_TYPE_LABELS,
  DOCUMENT_TYPE_LABELS,
} from "@/lib/constants/application.constants"
import { PET_SPECIES_LABELS } from "@/lib/constants/pet"
import type { PetSpecies } from "@prisma/client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// ---------- Helper ----------

function label(map: Record<string, string>, key: string | null | undefined): string {
  if (!key) return "N/A"
  return (map as Record<string, string>)[key] ?? key
}

// ---------- Section wrapper ----------

function Section({
  title,
  number,
  children,
}: {
  title: string
  number: number
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3 border-b pb-5 last:border-b-0 last:pb-0">
      <h4 className="text-base font-semibold text-foreground">
        {number}. {title}
      </h4>
      {children}
    </div>
  )
}

function Field({ label: l, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-muted-foreground">{l}</dt>
      <dd className="mt-0.5 text-sm text-foreground">{children || "N/A"}</dd>
    </div>
  )
}

// ---------- Types ----------

type ApplicationFormData = {
  applicant: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    occupation: string | null
  }
  livingEnvironment: any
  householdLifestyle: any
  petExperience: any
  adoptionCommitment: any
  agreements: any
  signatureUrl: string | null
  documents: {
    id: string
    type: ApplicationDocumentType
    idType: GovernmentIDType
    name: string
    url: string
  }[]
}

type ApplicationFormSectionsProps = {
  data: ApplicationFormData
}

// ---------- Component ----------

export function ApplicationFormSections({ data }: ApplicationFormSectionsProps) {
  const {
    applicant,
    livingEnvironment: le,
    householdLifestyle: hl,
    petExperience: pe,
    adoptionCommitment: ac,
    documents,
  } = data

  const livingEnv = (le ?? {}) as Record<string, any>
  const household = (hl ?? {}) as Record<string, any>
  const experience = (pe ?? {}) as Record<string, any>
  const commitment = (ac ?? {}) as Record<string, any>

  const [previewDoc, setPreviewDoc] = useState<{ url: string; name: string } | null>(null)

  return (
    <div className="space-y-6 rounded-lg border bg-card p-5 text-sm">
      {/* 1. Personal Information */}
      <Section title="Personal Information" number={1}>
        <dl className="grid gap-3 sm:grid-cols-2">
          <Field label="Full Name">{applicant.firstName} {applicant.lastName}</Field>
          <Field label="Email">{applicant.email}</Field>
          <Field label="Phone">{applicant.phone}</Field>
          <Field label="Address">{applicant.address}</Field>
          <Field label="Occupation">{applicant.occupation ?? "Not specified"}</Field>
        </dl>
      </Section>

      {/* 2. Living Environment */}
      <Section title="Living Environment" number={2}>
        <dl className="grid gap-3 sm:grid-cols-2">
          <Field label="Housing Type">{label(HOUSING_TYPE_LABELS, livingEnv.housingType)}</Field>
          <Field label="Ownership Status">{label(OWNERSHIP_STATUS_LABELS, livingEnv.ownershipStatus)}</Field>
          {livingEnv.ownershipStatus === "RENT" && (
            <Field label="Landlord Allows Pets">{label(LANDLORD_ALLOWS_PETS_LABELS, livingEnv.landlordAllowsPets)}</Field>
          )}
          <Field label="Property Size">{label(PROPERTY_SIZE_LABELS, livingEnv.propertySize)}</Field>
          <Field label="Pet-Friendly Property">
            {livingEnv.isPetFriendly === "YES" ? "Yes" : livingEnv.isPetFriendly === "NO" ? "No" : "N/A"}
          </Field>
        </dl>
      </Section>

      {/* 3. Household & Lifestyle */}
      <Section title="Household & Lifestyle" number={3}>
        <dl className="grid gap-3 sm:grid-cols-2">
          <Field label="Adults in Household">{household.numberOfAdults ?? "N/A"}</Field>
          <Field label="Children in Household">{household.numberOfChildren ?? "N/A"}</Field>
          {household.numberOfChildren > 0 && (
            <Field label="Children's Ages">{household.childrenAges || "N/A"}</Field>
          )}
          <Field label="Household Allergies">{household.householdHasAllergies ? "Yes" : "No"}</Field>
          {household.householdHasAllergies && (
            <Field label="Allergy Details">{household.allergyDetails || "N/A"}</Field>
          )}
          <Field label="Hours Alone Daily">{label(PET_ALONE_TIME_LABELS, household.hoursAloneDaily)}</Field>
          <Field label="Care When Away">{label(CARE_WHEN_AWAY_LABELS, household.careWhenAway)}</Field>
          <Field label="Primary Location">{label(PET_PRIMARY_LOCATION_LABELS, household.petPrimaryLocation)}</Field>
          <Field label="Sleeping Location">
            {label(PET_SLEEP_LOCATION_LABELS, household.petSleepLocation)}
            {household.petSleepLocation === "OTHER" ? ` (${household.petSleepLocationDetails})` : ""}
          </Field>
          <Field label="Primary Caregiver">
            {label(PRIMARY_CAREGIVER_LABELS, household.primaryCaregiver)}
            {household.primaryCaregiver === "OTHER" ? ` (${household.primaryCaregiverDetails})` : ""}
          </Field>
        </dl>
      </Section>

      {/* 4. Pet Experience */}
      <Section title="Pet Experience" number={4}>
        <dl className="grid gap-3 sm:grid-cols-2">
          <Field label="Currently Own Pets">{experience.hasCurrentPets ? "Yes" : "No"}</Field>
          {experience.hasCurrentPets && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold text-muted-foreground">Current Pets</dt>
              <dd className="mt-1 space-y-1">
                {(experience.currentPets ?? []).map((p: any, i: number) => (
                  <div key={i} className="rounded border bg-muted/30 p-2 text-xs">
                    {PET_SPECIES_LABELS[p.species as PetSpecies] ?? p.species} • {p.breed || "No breed"} • {p.age} • {p.sex?.toLowerCase()}
                  </div>
                ))}
                <div className="text-xs text-muted-foreground">
                  Vaccinated: {experience.currentPetsVaccinated === "YES" ? "Yes" : "No"}
                </div>
              </dd>
            </div>
          )}
          <Field label="Owned Pets (Past 5 Years)">{experience.ownedPetsPast5Years ? "Yes" : "No"}</Field>
          {experience.ownedPetsPast5Years && (
            <Field label="Past Pet Details">{experience.pastPetHistory || "N/A"}</Field>
          )}
          <Field label="Returned/Surrendered Pet">{experience.hasSurrenderedPets ? "Yes" : "No"}</Field>
          {experience.hasSurrenderedPets && (
            <Field label="Surrender Details">{experience.surrenderPetsDetails || "N/A"}</Field>
          )}
          <Field label="Experience Level">{label(EXPERIENCE_WITH_SPECIES_LABELS, experience.experienceWithSpecies)}</Field>
          <Field label="Heard About Pet From">{label(HEARD_ABOUT_PET_FROM_LABELS, experience.heardAboutPetFrom)}</Field>
        </dl>
      </Section>

      {/* 5. Adoption Commitment */}
      <Section title="Adoption Commitment" number={5}>
        <div className="space-y-3">
          <Field label="Why adopt this pet?">{commitment.whyThisPet || "N/A"}</Field>
          <Field label="Typical day routine">{commitment.typicalDayForPet || "N/A"}</Field>
          <Field label="Financial preparedness">{commitment.financiallyPrepared || "N/A"}</Field>
          <Field label="Adjustment period plan">{commitment.timeCommitment || "N/A"}</Field>
          <Field label="Commitment to regular vet care">{commitment.commitToVetCare ? "Yes" : "No"}</Field>
          {commitment.additionalInfo && (
            <Field label="Additional Info">{commitment.additionalInfo}</Field>
          )}
        </div>
      </Section>

      {/* 6. Documents */}
      <Section title="Uploaded Documents" number={6}>
        {documents.length > 0 ? (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-md border bg-muted/20 px-3 py-2"
              >
                <div className="flex items-center gap-2 text-sm">
                  <FileTextIcon className="size-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {doc.type === "GOVERNMENT_ID"
                        ? `Government ID (${GOVERNMENT_ID_TYPE_LABELS[doc.idType]})`
                        : DOCUMENT_TYPE_LABELS[doc.type]}
                    </p>
                    <p className="text-xs text-muted-foreground">{doc.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setPreviewDoc({ url: doc.url, name: doc.name })}
                    title="Preview file"
                  >
                    <EyeIcon className="size-4 text-muted-foreground hover:text-foreground" />
                  </Button>
                  <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" download title="Download file">
                      <DownloadIcon className="size-4" />
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No documents uploaded.</p>
        )}
      </Section>

      {/* Document Preview Modal */}
      <Dialog open={!!previewDoc} onOpenChange={(open) => !open && setPreviewDoc(null)}>
        <DialogContent className="max-w-3xl w-full p-6">
          <DialogHeader className="pb-3 border-b">
            <DialogTitle>{previewDoc?.name}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 flex items-center justify-center bg-muted/10 rounded-lg p-2 overflow-hidden border min-h-[400px]">
            {previewDoc && (
              previewDoc.url.toLowerCase().endsWith(".pdf") ? (
                <iframe
                  src={previewDoc.url}
                  className="w-full h-[60vh] border-0 rounded-md"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewDoc.url}
                  alt={previewDoc.name}
                  className="max-w-full max-h-[60vh] object-contain rounded-md"
                />
              )
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
