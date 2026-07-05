"use client"

import { useFormContext, useWatch } from "react-hook-form"
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  PetAloneTime,
  CareWhenAway,
  PetPrimaryLocation,
  PetSleepLocation,
  PrimaryCaregiver,
  PET_ALONE_TIME_LABELS,
  CARE_WHEN_AWAY_LABELS,
  PET_PRIMARY_LOCATION_LABELS,
  PET_SLEEP_LOCATION_LABELS,
  PRIMARY_CAREGIVER_LABELS,
} from "@/lib/constants/application.constants"

interface Step3HouseholdLifestyleProps {
  disabled?: boolean
}

export function Step3HouseholdLifestyle({ disabled }: Step3HouseholdLifestyleProps) {
  const {
    register,
    setValue,
    control,
    formState,
  } = useFormContext()
  const errors = formState.errors as any

  const numberOfAdults = useWatch({ control, name: "householdLifestyle.numberOfAdults" })
  const numberOfChildren = useWatch({ control, name: "householdLifestyle.numberOfChildren" })
  const childrenAges = useWatch({ control, name: "householdLifestyle.childrenAges" })
  const householdHasAllergies = useWatch({ control, name: "householdLifestyle.householdHasAllergies" })
  const allergyDetails = useWatch({ control, name: "householdLifestyle.allergyDetails" })
  const hoursAloneDaily = useWatch({ control, name: "householdLifestyle.hoursAloneDaily" })
  const careWhenAway = useWatch({ control, name: "householdLifestyle.careWhenAway" })
  const petPrimaryLocation = useWatch({ control, name: "householdLifestyle.petPrimaryLocation" })
  const petSleepLocation = useWatch({ control, name: "householdLifestyle.petSleepLocation" })
  const petSleepLocationDetails = useWatch({ control, name: "householdLifestyle.petSleepLocationDetails" })
  const primaryCaregiver = useWatch({ control, name: "householdLifestyle.primaryCaregiver" })
  const primaryCaregiverDetails = useWatch({ control, name: "householdLifestyle.primaryCaregiverDetails" })

  const hasChildren = numberOfChildren > 0
  const hasAllergies = householdHasAllergies === true
  const sleepLocOther = petSleepLocation === "OTHER"
  const caregiverOther = primaryCaregiver === "OTHER"

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Household & Lifestyle</h3>
        <p className="text-sm text-muted-foreground">
          Provide information about your household composition and daily schedule.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Number of Adults */}
        <Field>
          <FieldLabel htmlFor="num-adults">Number of Adults (18+)</FieldLabel>
          <Input
            id="num-adults"
            type="number"
            min={1}
            disabled={disabled}
            aria-invalid={!!errors.householdLifestyle?.numberOfAdults}
            {...register("householdLifestyle.numberOfAdults", { valueAsNumber: true })}
          />
          <FieldError errors={[errors.householdLifestyle?.numberOfAdults]} />
        </Field>

        {/* Number of Children */}
        <Field>
          <FieldLabel htmlFor="num-children">Number of Children (Under 18)</FieldLabel>
          <Input
            id="num-children"
            type="number"
            min={0}
            disabled={disabled}
            aria-invalid={!!errors.householdLifestyle?.numberOfChildren}
            {...register("householdLifestyle.numberOfChildren", { valueAsNumber: true })}
          />
          <FieldError errors={[errors.householdLifestyle?.numberOfChildren]} />
        </Field>

        {/* Children's Ages - Conditional */}
        {hasChildren && (
          <Field className="sm:col-span-2 animate-in fade-in slide-in-from-top-1 duration-200">
            <FieldLabel htmlFor="children-ages">Children&apos;s Ages</FieldLabel>
            <Input
              id="children-ages"
              placeholder="e.g. 3, 7, 12"
              disabled={disabled}
              aria-invalid={!!errors.householdLifestyle?.childrenAges}
              {...register("householdLifestyle.childrenAges")}
            />
            <FieldError errors={[errors.householdLifestyle?.childrenAges]} />
          </Field>
        )}

        {/* Allergies Select */}
        <Field>
          <FieldLabel htmlFor="has-allergies">Anyone in household with pet allergies?</FieldLabel>
          <Select
            value={householdHasAllergies === undefined ? undefined : householdHasAllergies ? "YES" : "NO"}
            onValueChange={(val) => {
              setValue("householdLifestyle.householdHasAllergies", val === "YES", {
                shouldDirty: true,
                shouldValidate: true,
              })
              if (val !== "YES") {
                setValue("householdLifestyle.allergyDetails", undefined)
              }
            }}
            disabled={disabled}
          >
            <SelectTrigger id="has-allergies" aria-invalid={!!errors.householdLifestyle?.householdHasAllergies}>
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="YES">Yes</SelectItem>
              <SelectItem value="NO">No</SelectItem>
            </SelectContent>
          </Select>
          <FieldError errors={[errors.householdLifestyle?.householdHasAllergies]} />
        </Field>

        {/* Allergy Details - Conditional */}
        {hasAllergies && (
          <Field className="sm:col-span-2 animate-in fade-in slide-in-from-top-1 duration-200">
            <FieldLabel htmlFor="allergy-details">Allergy Details</FieldLabel>
            <Textarea
              id="allergy-details"
              placeholder="Who has the allergy and how severe is it?"
              disabled={disabled}
              aria-invalid={!!errors.householdLifestyle?.allergyDetails}
              {...register("householdLifestyle.allergyDetails")}
            />
            <FieldError errors={[errors.householdLifestyle?.allergyDetails]} />
          </Field>
        )}

        {/* Hours Alone Daily */}
        <Field>
          <FieldLabel htmlFor="hours-alone">How long will the pet be alone daily?</FieldLabel>
          <Select
            value={hoursAloneDaily}
            onValueChange={(val) =>
              setValue("householdLifestyle.hoursAloneDaily", val, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            disabled={disabled}
          >
            <SelectTrigger id="hours-alone" aria-invalid={!!errors.householdLifestyle?.hoursAloneDaily}>
              <SelectValue placeholder="Select alone time" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(PetAloneTime).map((time) => (
                <SelectItem key={time} value={time}>
                  {PET_ALONE_TIME_LABELS[time]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={[errors.householdLifestyle?.hoursAloneDaily]} />
        </Field>

        {/* Care When Away */}
        <Field>
          <FieldLabel htmlFor="care-away">Who cares for the pet when the owner is away?</FieldLabel>
          <Select
            value={careWhenAway}
            onValueChange={(val) =>
              setValue("householdLifestyle.careWhenAway", val, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            disabled={disabled}
          >
            <SelectTrigger id="care-away" aria-invalid={!!errors.householdLifestyle?.careWhenAway}>
              <SelectValue placeholder="Select care plan" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(CareWhenAway).map((option) => (
                <SelectItem key={option} value={option}>
                  {CARE_WHEN_AWAY_LABELS[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={[errors.householdLifestyle?.careWhenAway]} />
        </Field>

        {/* Where Pet Lives */}
        <Field>
          <FieldLabel htmlFor="pet-location">Where will the pet primarily live?</FieldLabel>
          <Select
            value={petPrimaryLocation}
            onValueChange={(val) =>
              setValue("householdLifestyle.petPrimaryLocation", val, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            disabled={disabled}
          >
            <SelectTrigger id="pet-location" aria-invalid={!!errors.householdLifestyle?.petPrimaryLocation}>
              <SelectValue placeholder="Select primary location" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(PetPrimaryLocation).map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {PET_PRIMARY_LOCATION_LABELS[loc]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={[errors.householdLifestyle?.petPrimaryLocation]} />
        </Field>

        {/* Where Pet Sleeps */}
        <Field>
          <FieldLabel htmlFor="sleep-location">Where will the pet sleep?</FieldLabel>
          <Select
            value={petSleepLocation}
            onValueChange={(val) => {
              setValue("householdLifestyle.petSleepLocation", val, {
                shouldDirty: true,
                shouldValidate: true,
              })
              if (val !== "OTHER") {
                setValue("householdLifestyle.petSleepLocationDetails", undefined)
              }
            }}
            disabled={disabled}
          >
            <SelectTrigger id="sleep-location" aria-invalid={!!errors.householdLifestyle?.petSleepLocation}>
              <SelectValue placeholder="Select sleep location" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(PetSleepLocation).map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {PET_SLEEP_LOCATION_LABELS[loc]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={[errors.householdLifestyle?.petSleepLocation]} />
        </Field>

        {/* Sleep Location Detail - Conditional */}
        {sleepLocOther && (
          <Field className="sm:col-span-2 animate-in fade-in slide-in-from-top-1 duration-200">
            <FieldLabel htmlFor="sleep-location-detail">Sleep Location Details</FieldLabel>
            <Input
              id="sleep-location-detail"
              placeholder="Please describe sleeping arrangements"
              disabled={disabled}
              aria-invalid={!!errors.householdLifestyle?.petSleepLocationDetails}
              {...register("householdLifestyle.petSleepLocationDetails")}
            />
            <FieldError errors={[errors.householdLifestyle?.petSleepLocationDetails]} />
          </Field>
        )}

        {/* Who is primary caregiver */}
        <Field>
          <FieldLabel htmlFor="primary-caregiver">Who will be the primary caregiver?</FieldLabel>
          <Select
            value={primaryCaregiver}
            onValueChange={(val) => {
              setValue("householdLifestyle.primaryCaregiver", val, {
                shouldDirty: true,
                shouldValidate: true,
              })
              if (val !== "OTHER") {
                setValue("householdLifestyle.primaryCaregiverDetails", undefined)
              }
            }}
            disabled={disabled}
          >
            <SelectTrigger id="primary-caregiver" aria-invalid={!!errors.householdLifestyle?.primaryCaregiver}>
              <SelectValue placeholder="Select primary caregiver" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(PrimaryCaregiver).map((cg) => (
                <SelectItem key={cg} value={cg}>
                  {PRIMARY_CAREGIVER_LABELS[cg]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={[errors.householdLifestyle?.primaryCaregiver]} />
        </Field>

        {/* Caregiver details - Conditional */}
        {caregiverOther && (
          <Field className="sm:col-span-2 animate-in fade-in slide-in-from-top-1 duration-200">
            <FieldLabel htmlFor="primary-caregiver-detail">Caregiver Details</FieldLabel>
            <Input
              id="primary-caregiver-detail"
              placeholder="Describe other caregiver plans"
              disabled={disabled}
              aria-invalid={!!errors.householdLifestyle?.primaryCaregiverDetails}
              {...register("householdLifestyle.primaryCaregiverDetails")}
            />
            <FieldError errors={[errors.householdLifestyle?.primaryCaregiverDetails]} />
          </Field>
        )}
      </div>
    </div>
  )
}
