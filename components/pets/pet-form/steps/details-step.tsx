"use client"

import { useFormContext, useWatch } from "react-hook-form"

import { PetFormGrid, PetFormSection } from "@/components/pets/pet-form/pet-form-section"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  PET_AGE_UNIT_LABELS,
  PET_AGE_UNIT_VALUES,
  PET_GENDER_LABELS,
  PET_GENDER_VALUES,
  PET_SIZE_OPTIONS,
  PET_SPECIES_LABELS,
  PET_SPECIES_VALUES,
} from "@/lib/constants/pet"
import type { CreatePetFormInput } from "@/lib/validations/pet"

type DetailsStepProps = {
  disabled?: boolean
}

export function DetailsStep({ disabled }: DetailsStepProps) {
  const {
    register,
    setValue,
    control,
    formState: { errors },
  } = useFormContext<CreatePetFormInput>()

  const species = useWatch({ control, name: "species" })
  const gender = useWatch({ control, name: "gender" })
  const ageUnit = useWatch({ control, name: "ageUnit" })
  const size = useWatch({ control, name: "size" })

  return (
    <PetFormSection
      title="Pet details"
      description="Core information adopters use to find a match."
    >
      <PetFormGrid>
        <Field>
          <FieldLabel htmlFor="pet-name">Name</FieldLabel>
          <Input
            id="pet-name"
            disabled={disabled}
            aria-invalid={!!errors.name}
            {...register("name")}
          />
          <FieldError errors={[errors.name]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="pet-species">Species</FieldLabel>
          <Select
            value={species}
            onValueChange={(value) =>
              setValue("species", value as CreatePetFormInput["species"], {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            disabled={disabled}
          >
            <SelectTrigger
              id="pet-species"
              aria-invalid={!!errors.species}
            >
              <SelectValue placeholder="Select species" />
            </SelectTrigger>
            <SelectContent>
              {PET_SPECIES_VALUES.map((option) => (
                <SelectItem key={option} value={option}>
                  {PET_SPECIES_LABELS[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={[errors.species]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="pet-breed">Breed</FieldLabel>
          <Input
            id="pet-breed"
            disabled={disabled}
            aria-invalid={!!errors.breed}
            placeholder="e.g. Golden Retriever, Mixed breed"
            {...register("breed")}
          />
          <FieldDescription>Optional. Include “mixed breed” in the text if applicable.</FieldDescription>
          <FieldError errors={[errors.breed]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="pet-gender">Gender</FieldLabel>
          <Select
            value={gender}
            onValueChange={(value) =>
              setValue("gender", value as CreatePetFormInput["gender"], {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            disabled={disabled}
          >
            <SelectTrigger
              id="pet-gender"
              aria-invalid={!!errors.gender}
            >
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              {PET_GENDER_VALUES.map((option) => (
                <SelectItem key={option} value={option}>
                  {PET_GENDER_LABELS[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={[errors.gender]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="pet-age">Age</FieldLabel>
          <Input
            id="pet-age"
            type="number"
            min={1}
            max={30}
            disabled={disabled}
            aria-invalid={!!errors.age}
            {...register("age", { valueAsNumber: true })}
          />
          <FieldError errors={[errors.age]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="pet-age-unit">Age unit</FieldLabel>
          <Select
            value={ageUnit}
            onValueChange={(value) =>
              setValue("ageUnit", value as CreatePetFormInput["ageUnit"], {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            disabled={disabled}
          >
            <SelectTrigger
              id="pet-age-unit"
              aria-invalid={!!errors.ageUnit}
            >
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              {PET_AGE_UNIT_VALUES.map((option) => (
                <SelectItem key={option} value={option}>
                  {PET_AGE_UNIT_LABELS[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={[errors.ageUnit]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="pet-size">Size</FieldLabel>
          <Select
            value={size}
            onValueChange={(value) =>
              setValue("size", value as CreatePetFormInput["size"], {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            disabled={disabled}
          >
            <SelectTrigger
              id="pet-size"
              aria-invalid={!!errors.size}
            >
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              {PET_SIZE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={[errors.size]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="pet-color">Color</FieldLabel>
          <Input
            id="pet-color"
            disabled={disabled}
            aria-invalid={!!errors.color}
            placeholder="e.g. Brown and white"
            {...register("color")}
          />
          <FieldDescription>Optional coat or marking description.</FieldDescription>
          <FieldError errors={[errors.color]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="pet-weight">Weight (kg)</FieldLabel>
          <Input
            id="pet-weight"
            type="number"
            min={0}
            step="0.1"
            disabled={disabled}
            aria-invalid={!!errors.weightKg}
            placeholder="Optional"
            {...register("weightKg")}
          />
          <FieldDescription>Optional exact weight if known.</FieldDescription>
          <FieldError errors={[errors.weightKg]} />
        </Field>
      </PetFormGrid>
    </PetFormSection>
  )
}
