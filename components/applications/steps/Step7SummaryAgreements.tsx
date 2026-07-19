"use client"

import { useEffect } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldError,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field"
import { SignaturePad } from "@/components/applications/SignaturePad"
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
} from "@/lib/constants/application.constants"
import { PET_SPECIES_LABELS } from "@/lib/constants/pet"
import type { PetSpecies } from "@prisma/client"

interface UploadedDoc {
  id: string
  type: string
  idType: string
  name: string
  url: string
}

interface Step7SummaryAgreementsProps {
  applicationId: string
  petName: string
  user: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    occupation: string | null
  }
  documents: UploadedDoc[]
  signatureUrl: string | null
  onSignatureSaved: (url: string) => void
  disabled?: boolean
}

export function Step7SummaryAgreements({
  applicationId,
  petName,
  user,
  documents,
  signatureUrl,
  onSignatureSaved,
  disabled = false,
}: Step7SummaryAgreementsProps) {
  const { register, setValue, control, formState: { errors } } = useFormContext()

  // Watch agreements checkbox values
  const certifyTruthful = useWatch({ control, name: "agreements.certifyTruthful" }) ?? false
  const certifyNoAbuseNeglect = useWatch({ control, name: "agreements.certifyNoAbuseNeglect" }) ?? false
  const agreeToHomeVisit = useWatch({ control, name: "agreements.agreeToHomeVisit" }) ?? false
  const certifyNoAbandonment = useWatch({ control, name: "agreements.certifyNoAbandonment" }) ?? false
  const certifyComplyWithLaws = useWatch({ control, name: "agreements.certifyComplyWithLaws" }) ?? false
  const signatureSigned = useWatch({ control, name: "signatureSigned" }) ?? false

  // Watch answers for summary display
  const livingEnv = useWatch({ control, name: "livingEnvironment" }) ?? {}
  const household = useWatch({ control, name: "householdLifestyle" }) ?? {}
  const experience = useWatch({ control, name: "petExperience" }) ?? {}
  const commitment = useWatch({ control, name: "adoptionCommitment" }) ?? {}

  // Sync signature saved status with validation field
  useEffect(() => {
    setValue("signatureSigned", !!signatureUrl, { shouldValidate: true })
  }, [signatureUrl, setValue])

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Review & Submit</h3>
        <p className="text-sm text-muted-foreground">
          Please review your answers before certifying the agreements and submitting.
        </p>
      </div>

      {/* Structured Summary Section */}
      <div className="space-y-6 rounded-lg border bg-muted/5 p-5 text-sm">
        {/* Personal Details */}
        <div className="space-y-2 border-b pb-4">
          <h4 className="font-semibold text-foreground text-base">1. Personal Information</h4>
          <dl className="grid gap-2 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold text-muted-foreground">Full Name</dt>
              <dd className="text-foreground">{user.firstName} {user.lastName}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted-foreground">Email</dt>
              <dd className="text-foreground">{user.email}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted-foreground">Phone</dt>
              <dd className="text-foreground">{user.phone}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted-foreground">Address</dt>
              <dd className="text-foreground">{user.address}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted-foreground">Occupation</dt>
              <dd className="text-foreground">{user.occupation ?? "None"}</dd>
            </div>
          </dl>
        </div>

        {/* Living Environment */}
        <div className="space-y-2 border-b pb-4">
          <h4 className="font-semibold text-foreground text-base">2. Living Environment</h4>
          <dl className="grid gap-2 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold text-muted-foreground">Housing Type</dt>
              <dd className="text-foreground">
                {livingEnv.housingType ? HOUSING_TYPE_LABELS[livingEnv.housingType as keyof typeof HOUSING_TYPE_LABELS] : "N/A"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted-foreground">Ownership Status</dt>
              <dd className="text-foreground">
                {livingEnv.ownershipStatus ? OWNERSHIP_STATUS_LABELS[livingEnv.ownershipStatus as keyof typeof OWNERSHIP_STATUS_LABELS] : "N/A"}
              </dd>
            </div>
            {livingEnv.ownershipStatus === "RENT" && (
              <div>
                <dt className="text-xs font-semibold text-muted-foreground">Landlord Allows Pets</dt>
                <dd className="text-foreground">
                  {livingEnv.landlordAllowsPets ? LANDLORD_ALLOWS_PETS_LABELS[livingEnv.landlordAllowsPets as keyof typeof LANDLORD_ALLOWS_PETS_LABELS] : "N/A"}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-xs font-semibold text-muted-foreground">Property Size</dt>
              <dd className="text-foreground">
                {livingEnv.propertySize ? PROPERTY_SIZE_LABELS[livingEnv.propertySize as keyof typeof PROPERTY_SIZE_LABELS] : "N/A"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted-foreground">Pet-Friendly Property</dt>
              <dd className="text-foreground">{livingEnv.isPetFriendly === "YES" ? "Yes" : livingEnv.isPetFriendly === "NO" ? "No" : "Not Sure"}</dd>
            </div>
          </dl>
        </div>

        {/* Household & Lifestyle */}
        <div className="space-y-2 border-b pb-4">
          <h4 className="font-semibold text-foreground text-base">3. Household & Lifestyle</h4>
          <dl className="grid gap-2 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold text-muted-foreground">Adults in Household</dt>
              <dd className="text-foreground">{household.numberOfAdults ?? "N/A"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted-foreground">Children in Household</dt>
              <dd className="text-foreground">{household.numberOfChildren ?? "N/A"}</dd>
            </div>
            {household.numberOfChildren > 0 && (
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold text-muted-foreground">Children&apos;s Ages</dt>
                <dd className="text-foreground">{household.childrenAges || "N/A"}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs font-semibold text-muted-foreground">Household Allergies</dt>
              <dd className="text-foreground">{household.householdHasAllergies ? "Yes" : "No"}</dd>
            </div>
            {household.householdHasAllergies && (
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold text-muted-foreground">Allergy Details</dt>
                <dd className="text-foreground">{household.allergyDetails || "N/A"}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs font-semibold text-muted-foreground">Hours Alone Daily</dt>
              <dd className="text-foreground">
                {household.hoursAloneDaily ? PET_ALONE_TIME_LABELS[household.hoursAloneDaily as keyof typeof PET_ALONE_TIME_LABELS] : "N/A"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted-foreground">Care When Away</dt>
              <dd className="text-foreground">
                {household.careWhenAway ? CARE_WHEN_AWAY_LABELS[household.careWhenAway as keyof typeof CARE_WHEN_AWAY_LABELS] : "N/A"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted-foreground">Primary Location</dt>
              <dd className="text-foreground">
                {household.petPrimaryLocation ? PET_PRIMARY_LOCATION_LABELS[household.petPrimaryLocation as keyof typeof PET_PRIMARY_LOCATION_LABELS] : "N/A"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted-foreground">Sleeping Location</dt>
              <dd className="text-foreground">
                {household.petSleepLocation ? PET_SLEEP_LOCATION_LABELS[household.petSleepLocation as keyof typeof PET_SLEEP_LOCATION_LABELS] : "N/A"}
                {household.petSleepLocation === "OTHER" && ` (${household.petSleepLocationDetails})`}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted-foreground">Primary Caregiver</dt>
              <dd className="text-foreground">
                {household.primaryCaregiver ? PRIMARY_CAREGIVER_LABELS[household.primaryCaregiver as keyof typeof PRIMARY_CAREGIVER_LABELS] : "N/A"}
                {household.primaryCaregiver === "OTHER" && ` (${household.primaryCaregiverDetails})`}
              </dd>
            </div>
          </dl>
        </div>

        {/* Pet Experience */}
        <div className="space-y-2 border-b pb-4">
          <h4 className="font-semibold text-foreground text-base">4. Pet Experience</h4>
          <dl className="grid gap-2 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold text-muted-foreground">Currently Own Pets</dt>
              <dd className="text-foreground">{experience.hasCurrentPets ? "Yes" : "No"}</dd>
            </div>
            {experience.hasCurrentPets && (
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold text-muted-foreground">Current Pets List</dt>
                <dd className="mt-1 space-y-1">
                  {experience.currentPets?.map((p: any, i: number) => (
                    <div key={i} className="text-xs border rounded p-1.5 bg-muted/30">
                      {PET_SPECIES_LABELS[p.species as PetSpecies]} &bull; {p.breed || "No breed"} &bull; {p.age} &bull; {p.sex.toLowerCase()}
                    </div>
                  ))}
                  <div className="text-xs text-muted-foreground mt-1">
                    Vaccinated: {experience.currentPetsVaccinated === "YES" ? "Yes" : "No"}
                  </div>
                </dd>
              </div>
            )}
            <div>
              <dt className="text-xs font-semibold text-muted-foreground">Owned Pets (Past 5 Years)</dt>
              <dd className="text-foreground">{experience.ownedPetsPast5Years ? "Yes" : "No"}</dd>
            </div>
            {experience.ownedPetsPast5Years && (
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold text-muted-foreground">Past Pet Details</dt>
                <dd className="text-foreground text-xs">{experience.pastPetHistory}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs font-semibold text-muted-foreground">Returned/Surrendered Pet</dt>
              <dd className="text-foreground">{experience.hasSurrenderedPets ? "Yes" : "No"}</dd>
            </div>
            {experience.hasSurrenderedPets && (
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold text-muted-foreground">Surrender Details</dt>
                <dd className="text-foreground text-xs">{experience.surrenderPetsDetails}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs font-semibold text-muted-foreground">Experience level</dt>
              <dd className="text-foreground">
                {experience.experienceWithSpecies ? EXPERIENCE_WITH_SPECIES_LABELS[experience.experienceWithSpecies as keyof typeof EXPERIENCE_WITH_SPECIES_LABELS] : "N/A"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted-foreground">Heard about us from</dt>
              <dd className="text-foreground">
                {experience.heardAboutPetFrom ? HEARD_ABOUT_PET_FROM_LABELS[experience.heardAboutPetFrom as keyof typeof HEARD_ABOUT_PET_FROM_LABELS] : "N/A"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="space-y-2 border-b pb-4">
          <h4 className="font-semibold text-foreground text-base">5. Adoption Commitment</h4>
          <div className="space-y-2">
            <div>
              <h5 className="text-xs font-semibold text-muted-foreground">Why adopt this pet?</h5>
              <p className="text-xs text-foreground">{commitment.whyThisPet}</p>
            </div>
            <div>
              <h5 className="text-xs font-semibold text-muted-foreground">Typical Day routine</h5>
              <p className="text-xs text-foreground">{commitment.typicalDayForPet}</p>
            </div>
            <div>
              <h5 className="text-xs font-semibold text-muted-foreground">Financial preparedness</h5>
              <p className="text-xs text-foreground">{commitment.financiallyPrepared}</p>
            </div>
            <div>
              <h5 className="text-xs font-semibold text-muted-foreground">Adjustment period plan</h5>
              <p className="text-xs text-foreground">{commitment.timeCommitment}</p>
            </div>
            <div>
              <h5 className="text-xs font-semibold text-muted-foreground">Commitment to regular vet care</h5>
              <p className="text-xs text-foreground">{commitment.commitToVetCare ? "Yes" : "No"}</p>
            </div>
            {commitment.additionalInfo && (
              <div>
                <h5 className="text-xs font-semibold text-muted-foreground">Additional Info</h5>
                <p className="text-xs text-foreground">{commitment.additionalInfo}</p>
              </div>
            )}
          </div>
        </div>

        {/* Documents */}
        <div className="space-y-2">
          <h4 className="font-semibold text-foreground text-base">6. Uploaded Documents</h4>
          <ul className="list-disc pl-5 text-xs text-foreground/80 space-y-1">
            {documents.map((doc) => (
              <li key={doc.id}>
                <strong>
                  {doc.type === "GOVERNMENT_ID"
                    ? `Government ID (${GOVERNMENT_ID_TYPE_LABELS[doc.idType as keyof typeof GOVERNMENT_ID_TYPE_LABELS]})`
                    : "Proof of Address"}
                  :
                </strong>{" "}
                {doc.name}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Agreements Section */}
      <div className="space-y-4 pt-4 border-t">
        <h4 className="font-bold text-foreground">Agreements</h4>
        <p className="text-sm text-muted-foreground">
          Please check the following certifications to proceed. All agreements are required.
        </p>

        <div className="space-y-4">
          {/* Agreement 1 */}
          <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/10">
            <Checkbox
              id="certify-truthful"
              checked={certifyTruthful}
              onCheckedChange={(checked) =>
                setValue("agreements.certifyTruthful", checked === true, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              disabled={disabled}
            />
            <div className="space-y-1 leading-none">
              <label htmlFor="certify-truthful" className="text-sm font-medium text-foreground cursor-pointer">
                I certify that all information provided is true and accurate.
              </label>
              <p className="text-xs text-muted-foreground">
                Providing false information will result in immediate rejection of the application.
              </p>
            </div>
          </div>

          {/* Agreement 2 */}
          <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/10">
            <Checkbox
              id="certify-abuse"
              checked={certifyNoAbuseNeglect}
              onCheckedChange={(checked) =>
                setValue("agreements.certifyNoAbuseNeglect", checked === true, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              disabled={disabled}
            />
            <div className="space-y-1 leading-none">
              <label htmlFor="certify-abuse" className="text-sm font-medium text-foreground cursor-pointer">
                I understand that submitting this application does not guarantee approval.
              </label>
              <p className="text-xs text-muted-foreground">
                The shelter or pet owner reviews multiple applications to ensure the best fit.
              </p>
            </div>
          </div>

          {/* Agreement 3 */}
          <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/10">
            <Checkbox
              id="agree-home"
              checked={agreeToHomeVisit}
              onCheckedChange={(checked) =>
                setValue("agreements.agreeToHomeVisit", checked === true, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              disabled={disabled}
            />
            <div className="space-y-1 leading-none">
              <label htmlFor="agree-home" className="text-sm font-medium text-foreground cursor-pointer">
                I agree to a home visit if requested by the shelter or pet owner.
              </label>
              <p className="text-xs text-muted-foreground">
                A home inspection helps confirm the living environment matches the application answers.
              </p>
            </div>
          </div>

          {/* Agreement 4 */}
          <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/10">
            <Checkbox
              id="certify-abandon"
              checked={certifyNoAbandonment}
              onCheckedChange={(checked) => {
                setValue("agreements.certifyNoAbandonment", checked === true, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
                setValue("agreements.certifyResponsible", checked === true, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }}
              disabled={disabled}
            />
            <div className="space-y-1 leading-none">
              <label htmlFor="certify-abandon" className="text-sm font-medium text-foreground cursor-pointer">
                I certify I will provide responsible care and will not abuse, neglect, or abandon this pet.
              </label>
              <p className="text-xs text-muted-foreground">
                You commit to providing food, shelter, vet care, and affection for the pet&apos;s lifetime.
              </p>
            </div>
          </div>

          {/* Agreement 5 */}
          <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/10">
            <Checkbox
              id="certify-laws"
              checked={certifyComplyWithLaws}
              onCheckedChange={(checked) =>
                setValue("agreements.certifyComplyWithLaws", checked === true, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              disabled={disabled}
            />
            <div className="space-y-1 leading-none">
              <label htmlFor="certify-laws" className="text-sm font-medium text-foreground cursor-pointer">
                I certify I will comply with all applicable animal welfare laws.
              </label>
              <p className="text-xs text-muted-foreground">
                You agree to comply with national and local pet licensing, vaccination, and care laws.
              </p>
            </div>
          </div>
        </div>

        {/* Display validation errors for agreements */}
        {(errors.agreements as any) && (
          <p className="text-xs text-destructive font-medium mt-1">
            Please accept all agreements before submitting the application.
          </p>
        )}
      </div>

      {/* Digital Signature Pad */}
      <div className="space-y-4 pt-6 border-t">
        <div>
          <FieldLabel className="text-base font-bold text-foreground">Digital Signature</FieldLabel>
          <FieldDescription>
            Please draw your signature below to confirm your certifications.
          </FieldDescription>
        </div>

        <SignaturePad
          applicationId={applicationId}
          defaultValue={signatureUrl}
          onSignatureSaved={onSignatureSaved}
          disabled={disabled}
        />
        <input type="hidden" {...register("signatureSigned")} />
        <FieldError errors={[errors.signatureSigned]} />
      </div>
    </div>
  )
}
