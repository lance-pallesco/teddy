"use client"

import { useFormContext, useWatch } from "react-hook-form"

import { PetFormGrid, PetFormSection } from "@/components/pets/pet-form/pet-form-section"
import { TemperamentMultiSelect } from "@/components/pets/pet-form/temperament-multi-select"
import { YesNoSelect } from "@/components/pets/pet-form/yes-no-select"
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { cn } from "@/lib/utils"
import type { PetYesNoValue } from "@/lib/constants/pet"
import type { CreatePetFormInput } from "@/lib/validations/pet"

type CareStepProps = {
  disabled?: boolean
}

export function CareStep({ disabled }: CareStepProps) {
  const {
    register,
    setValue,
    control,
    formState: { errors },
  } = useFormContext<CreatePetFormInput>()

  const tags = useWatch({ control, name: "tags" }) ?? []
  const goodWithKids = useWatch({ control, name: "goodWithKids" })
  const goodWithDogs = useWatch({ control, name: "goodWithDogs" })
  const goodWithCats = useWatch({ control, name: "goodWithCats" })
  const isHouseTrained = useWatch({ control, name: "isHouseTrained" })
  const specialNeeds = useWatch({ control, name: "specialNeeds" })

  function setYesNoField(
    name: keyof Pick<
      CreatePetFormInput,
      "goodWithKids" | "goodWithDogs" | "goodWithCats" | "isHouseTrained" | "specialNeeds"
    >,
    value: PetYesNoValue
  ) {
    setValue(name, value, { shouldDirty: true, shouldValidate: true })

    if (name === "specialNeeds" && value === "NO") {
      setValue("specialNeedsNote", "", { shouldDirty: true, shouldValidate: true })
    }
  }

  return (
    <PetFormSection
      title="Behavior & care"
      description="Help adopters understand temperament and home fit."
    >
      <PetFormGrid>
        <TemperamentMultiSelect
          value={tags}
          disabled={disabled}
          error={errors.tags}
          onChange={(next) =>
            setValue("tags", next, { shouldDirty: true, shouldValidate: true })
          }
        />

        <YesNoSelect
          id="good-with-kids"
          label="Good with kids?"
          value={goodWithKids}
          disabled={disabled}
          error={errors.goodWithKids}
          onChange={(value) => setYesNoField("goodWithKids", value)}
        />

        <YesNoSelect
          id="good-with-dogs"
          label="Good with dogs?"
          value={goodWithDogs}
          disabled={disabled}
          error={errors.goodWithDogs}
          onChange={(value) => setYesNoField("goodWithDogs", value)}
        />

        <YesNoSelect
          id="good-with-cats"
          label="Good with cats?"
          value={goodWithCats}
          disabled={disabled}
          error={errors.goodWithCats}
          onChange={(value) => setYesNoField("goodWithCats", value)}
        />

        <YesNoSelect
          id="house-trained"
          label="House trained?"
          value={isHouseTrained}
          disabled={disabled}
          error={errors.isHouseTrained}
          onChange={(value) => setYesNoField("isHouseTrained", value)}
        />

        <YesNoSelect
          id="special-needs"
          label="Has special needs?"
          value={specialNeeds}
          disabled={disabled}
          error={errors.specialNeeds}
          onChange={(value) => setYesNoField("specialNeeds", value)}
        />

        <div
          className={cn(
            "grid transition-all duration-200 md:col-span-2",
            specialNeeds === "YES" ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          )}
        >
          <div className="overflow-hidden">
            <Field>
              <FieldLabel htmlFor="special-needs-note">Special needs description</FieldLabel>
              <textarea
                id="special-needs-note"
                rows={5}
                disabled={disabled || specialNeeds !== "YES"}
                aria-invalid={!!errors.specialNeedsNote}
                {...register("specialNeedsNote")}
              />
              <FieldError errors={[errors.specialNeedsNote]} />
            </Field>
          </div>
        </div>
      </PetFormGrid>
    </PetFormSection>
  )
}
