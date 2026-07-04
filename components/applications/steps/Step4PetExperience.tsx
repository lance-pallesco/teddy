"use client"

import { useEffect } from "react"
import { useFieldArray, useFormContext, useWatch } from "react-hook-form"
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PetSpecies } from "@prisma/client"
import {
  ExperienceWithSpecies,
  HeardAboutPetFrom,
  EXPERIENCE_WITH_SPECIES_LABELS,
  HEARD_ABOUT_PET_FROM_LABELS,
} from "@/lib/constants/application.constants"
import { PET_SPECIES_LABELS } from "@/lib/constants/pet"
import { PlusIcon, TrashIcon } from "lucide-react"

interface Step4PetExperienceProps {
  petSpecies: PetSpecies
  disabled?: boolean
}

export function Step4PetExperience({ petSpecies, disabled }: Step4PetExperienceProps) {
  const {
    register,
    setValue,
    control,
    formState,
  } = useFormContext()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const errors = formState.errors as any

  const { fields, append, remove } = useFieldArray({
    control,
    name: "petExperience.currentPets",
  })

  const hasCurrentPets = useWatch({ control, name: "petExperience.hasCurrentPets" })
  const currentPets = useWatch({ control, name: "petExperience.currentPets" })
  const currentPetsVaccinated = useWatch({ control, name: "petExperience.currentPetsVaccinated" })
  const ownedPetsPast5Years = useWatch({ control, name: "petExperience.ownedPetsPast5Years" })
  const hasSurrenderedPets = useWatch({ control, name: "petExperience.hasSurrenderedPets" })
  const experienceWithSpecies = useWatch({ control, name: "petExperience.experienceWithSpecies" })
  const heardAboutPetFrom = useWatch({ control, name: "petExperience.heardAboutPetFrom" })

  // Initialize with at least 1 pet row if they have current pets and list is empty
  useEffect(() => {
    if (hasCurrentPets === true && fields.length === 0) {
      append({ species: "DOG", breed: "", age: "", sex: "UNKNOWN" })
    }
  }, [hasCurrentPets, fields.length, append])

  const showCurrentPets = hasCurrentPets === true
  const showPastPets = ownedPetsPast5Years === true
  const showSurrender = hasSurrenderedPets === true

  // Map PetSpecies to plural label
  const speciesPluralMap: Record<PetSpecies, string> = {
    DOG: "Dogs",
    CAT: "Cats",
    RABBIT: "Rabbits",
    BIRD: "Birds",
    OTHER: "this species",
  }
  const targetSpeciesLabel = speciesPluralMap[petSpecies] ?? "this species"

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Pet Experience</h3>
        <p className="text-sm text-muted-foreground">
          Tell us about your current and past experience with pets.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Currently Own Other Pets */}
        <Field>
          <FieldLabel htmlFor="has-current-pets">Currently own other pets?</FieldLabel>
          <Select
            value={hasCurrentPets === undefined ? undefined : hasCurrentPets ? "YES" : "NO"}
            onValueChange={(val) => {
              setValue("petExperience.hasCurrentPets", val === "YES", {
                shouldDirty: true,
                shouldValidate: true,
              })
              if (val !== "YES") {
                setValue("petExperience.currentPets", null)
                setValue("petExperience.currentPetsVaccinated", undefined)
              }
            }}
            disabled={disabled}
          >
            <SelectTrigger id="has-current-pets" aria-invalid={!!errors.petExperience?.hasCurrentPets}>
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="YES">Yes</SelectItem>
              <SelectItem value="NO">No</SelectItem>
            </SelectContent>
          </Select>
          <FieldError errors={[errors.petExperience?.hasCurrentPets]} />
        </Field>

        {/* Current Pets Repeatable Group - Conditional */}
        {showCurrentPets && (
          <div className="space-y-4 rounded-lg border bg-muted/10 p-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-foreground">Current Household Pets</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled}
                onClick={() => append({ species: "DOG", breed: "", age: "", sex: "UNKNOWN" })}
              >
                <PlusIcon className="size-4 mr-1.5" />
                Add Pet
              </Button>
            </div>

            {fields.map((item, index) => (
              <div
                key={item.id}
                className="grid gap-3 sm:grid-cols-4 items-end border-b pb-4 last:border-b-0 last:pb-0"
              >
                {/* Species */}
                <Field>
                  <FieldLabel>Species</FieldLabel>
                  <Select
                    value={currentPets?.[index]?.species}
                    onValueChange={(val) =>
                      setValue(`petExperience.currentPets.${index}.species`, val, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    disabled={disabled}
                  >
                    <SelectTrigger aria-label="Select pet species">
                      <SelectValue placeholder="Species" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(PetSpecies).map((sp) => (
                        <SelectItem key={sp} value={sp}>
                          {PET_SPECIES_LABELS[sp]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={[errors.petExperience?.currentPets?.[index]?.species]} />
                </Field>

                {/* Breed */}
                <Field>
                  <FieldLabel>Breed (Optional)</FieldLabel>
                  <Input
                    placeholder="e.g. Persian, Lab"
                    disabled={disabled}
                    {...register(`petExperience.currentPets.${index}.breed`)}
                  />
                  <FieldError errors={[errors.petExperience?.currentPets?.[index]?.breed]} />
                </Field>

                {/* Age */}
                <Field>
                  <FieldLabel>Age</FieldLabel>
                  <Input
                    placeholder="e.g. 2 years, 6 months"
                    disabled={disabled}
                    {...register(`petExperience.currentPets.${index}.age`)}
                  />
                  <FieldError errors={[errors.petExperience?.currentPets?.[index]?.age]} />
                </Field>

                {/* Sex */}
                <div className="flex items-center gap-2">
                  <Field className="flex-1">
                    <FieldLabel>Sex</FieldLabel>
                    <Select
                      value={currentPets?.[index]?.sex}
                      onValueChange={(val) =>
                        setValue(`petExperience.currentPets.${index}.sex`, val, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                      disabled={disabled}
                    >
                      <SelectTrigger aria-label="Select pet sex">
                        <SelectValue placeholder="Sex" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                        <SelectItem value="UNKNOWN">Unknown</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldError errors={[errors.petExperience?.currentPets?.[index]?.sex]} />
                  </Field>

                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={disabled}
                      onClick={() => remove(index)}
                      className="mb-1 text-destructive hover:bg-destructive/10"
                      aria-label="Remove pet"
                    >
                      <TrashIcon className="size-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {/* Current Pets Vaccinated */}
            <Field className="pt-2">
              <FieldLabel htmlFor="pets-vaccinated">Are current pets fully vaccinated?</FieldLabel>
              <Select
                value={currentPetsVaccinated}
                onValueChange={(val) =>
                  setValue("petExperience.currentPetsVaccinated", val, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                disabled={disabled}
              >
                <SelectTrigger id="pets-vaccinated" aria-invalid={!!errors.petExperience?.currentPetsVaccinated}>
                  <SelectValue placeholder="Select vaccination status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="YES">Yes</SelectItem>
                  <SelectItem value="NO">No</SelectItem>
                  <SelectItem value="NOT_SURE">Not Sure</SelectItem>
                </SelectContent>
              </Select>
              <FieldError errors={[errors.petExperience?.currentPetsVaccinated]} />
            </Field>
          </div>
        )}

        {/* Owned Pets in Past 5 Years */}
        <Field>
          <FieldLabel htmlFor="owned-past-pets">Owned pets in the past 5 years?</FieldLabel>
          <Select
            value={ownedPetsPast5Years === undefined ? undefined : ownedPetsPast5Years ? "YES" : "NO"}
            onValueChange={(val) => {
              setValue("petExperience.ownedPetsPast5Years", val === "YES", {
                shouldDirty: true,
                shouldValidate: true,
              })
              if (val !== "YES") {
                setValue("petExperience.pastPetHistory", undefined)
              }
            }}
            disabled={disabled}
          >
            <SelectTrigger id="owned-past-pets" aria-invalid={!!errors.petExperience?.ownedPetsPast5Years}>
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="YES">Yes</SelectItem>
              <SelectItem value="NO">No</SelectItem>
            </SelectContent>
          </Select>
          <FieldError errors={[errors.petExperience?.ownedPetsPast5Years]} />
        </Field>

        {/* Past Pet History - Conditional */}
        {showPastPets && (
          <Field className="animate-in fade-in duration-200">
            <FieldLabel htmlFor="past-pet-history">Past Pet History</FieldLabel>
            <Textarea
              id="past-pet-history"
              placeholder="What pets did you have, and what happened to them? (e.g. passed away, rehomed, still with family)"
              disabled={disabled}
              aria-invalid={!!errors.petExperience?.pastPetHistory}
              {...register("petExperience.pastPetHistory")}
            />
            <FieldError errors={[errors.petExperience?.pastPetHistory]} />
          </Field>
        )}

        {/* Returned or Surrendered a Pet */}
        <Field>
          <FieldLabel htmlFor="has-surrendered">Have you ever returned or surrendered a pet?</FieldLabel>
          <Select
            value={hasSurrenderedPets === undefined ? undefined : hasSurrenderedPets ? "YES" : "NO"}
            onValueChange={(val) => {
              setValue("petExperience.hasSurrenderedPets", val === "YES", {
                shouldDirty: true,
                shouldValidate: true,
              })
              if (val !== "YES") {
                setValue("petExperience.surrenderPetsDetails", undefined)
              }
            }}
            disabled={disabled}
          >
            <SelectTrigger id="has-surrendered" aria-invalid={!!errors.petExperience?.hasSurrenderedPets}>
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="YES">Yes</SelectItem>
              <SelectItem value="NO">No</SelectItem>
            </SelectContent>
          </Select>
          <FieldError errors={[errors.petExperience?.hasSurrenderedPets]} />
        </Field>

        {/* Surrender Details - Conditional */}
        {showSurrender && (
          <Field className="animate-in fade-in duration-200">
            <FieldLabel htmlFor="surrender-details">Surrender Details</FieldLabel>
            <Textarea
              id="surrender-details"
              placeholder="Please describe what pet and why"
              disabled={disabled}
              aria-invalid={!!errors.petExperience?.surrenderPetsDetails}
              {...register("petExperience.surrenderPetsDetails")}
            />
            <FieldError errors={[errors.petExperience?.surrenderPetsDetails]} />
          </Field>
        )}

        {/* Experience with this Species */}
        <Field>
          <FieldLabel htmlFor="exp-species">Experience with {targetSpeciesLabel}</FieldLabel>
          <Select
            value={experienceWithSpecies}
            onValueChange={(val) =>
              setValue("petExperience.experienceWithSpecies", val, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            disabled={disabled}
          >
            <SelectTrigger id="exp-species" aria-invalid={!!errors.petExperience?.experienceWithSpecies}>
              <SelectValue placeholder="Select experience level" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(ExperienceWithSpecies).map((exp) => (
                <SelectItem key={exp} value={exp}>
                  {EXPERIENCE_WITH_SPECIES_LABELS[exp]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={[errors.petExperience?.experienceWithSpecies]} />
        </Field>

        {/* How did you hear about this pet */}
        <Field>
          <FieldLabel htmlFor="heard-about">How did you hear about this pet?</FieldLabel>
          <Select
            value={heardAboutPetFrom}
            onValueChange={(val) =>
              setValue("petExperience.heardAboutPetFrom", val, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            disabled={disabled}
          >
            <SelectTrigger id="heard-about" aria-invalid={!!errors.petExperience?.heardAboutPetFrom}>
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(HeardAboutPetFrom).map((source) => (
                <SelectItem key={source} value={source}>
                  {HEARD_ABOUT_PET_FROM_LABELS[source]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={[errors.petExperience?.heardAboutPetFrom]} />
        </Field>
      </div>
    </div>
  )
}
