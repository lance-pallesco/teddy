"use client"

import { useEffect, useMemo, useState } from "react"
import { useFormContext, useWatch } from "react-hook-form"

import { PetPhotoUploader, type PetPhotoItem } from "@/components/pets/pet-photo-uploader"
import { PetFormSection } from "@/components/pets/pet-form/pet-form-section"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { PET_FORM_TEXTAREA_CLASS } from "@/lib/constants/pet"
import { buildDefaultPetDescription } from "@/lib/utils/pet-description"
import type { CreatePetFormInput } from "@/lib/validations/pet"

type MediaStepProps = {
  disabled?: boolean
}

function urlsToPhotoItems(urls: string[]): PetPhotoItem[] {
  return urls.map((url) => ({ id: url, url }))
}

function yesNoToBoolean(value: CreatePetFormInput["goodWithKids"]): boolean {
  return value === "YES"
}

export function MediaStep({ disabled }: MediaStepProps) {
  const {
    register,
    setValue,
    control,
    getValues,
    formState: { errors, dirtyFields },
  } = useFormContext<CreatePetFormInput>()

  const imageUrls = useWatch({ control, name: "imageUrls" }) ?? []
  const values = useWatch({ control })

  const [photoItems, setPhotoItems] = useState<PetPhotoItem[]>(() =>
    urlsToPhotoItems(imageUrls)
  )

  const uploadedUrls = useMemo(
    () => photoItems.filter((item) => item.url && !item.isUploading).map((item) => item.url),
    [photoItems]
  )

  useEffect(() => {
    setValue("imageUrls", uploadedUrls, { shouldDirty: true, shouldValidate: true })
  }, [setValue, uploadedUrls])

  useEffect(() => {
    if (dirtyFields.description) {
      return
    }

    const current = getValues()

    if (!current.name || !current.species || !current.gender || !current.size) {
      return
    }

    if (current.tags.length === 0) {
      return
    }

    setValue(
      "description",
      buildDefaultPetDescription({
        name: current.name,
        species: current.species,
        breed: current.breed,
        age: Number(current.age),
        ageUnit: current.ageUnit,
        gender: current.gender,
        size: current.size,
        color: current.color,
        tags: current.tags,
        goodWithKids: yesNoToBoolean(current.goodWithKids),
        goodWithDogs: yesNoToBoolean(current.goodWithDogs),
        goodWithCats: yesNoToBoolean(current.goodWithCats),
        isHouseTrained: yesNoToBoolean(current.isHouseTrained),
        specialNeeds: yesNoToBoolean(current.specialNeeds),
        specialNeedsNote: current.specialNeedsNote,
      }),
      { shouldDirty: false, shouldValidate: true }
    )
  }, [dirtyFields.description, getValues, setValue, values])

  const isUploading = photoItems.some((item) => item.isUploading)

  return (
    <div className="flex flex-col gap-6">
      <PetFormSection title="Photos" description="The first photo is used as the primary listing image.">
        <Field>
          <FieldLabel>Pet photos</FieldLabel>
          <PetPhotoUploader
            value={photoItems}
            disabled={disabled || isUploading}
            onChange={setPhotoItems}
          />
          <FieldDescription>At least one photo is required.</FieldDescription>
          <FieldError errors={[errors.imageUrls]} />
        </Field>
      </PetFormSection>

      <PetFormSection
        title="Listing description"
        description="Shown to adopters. Auto-filled from earlier answers — edit as needed."
      >
        <Field>
          <FieldLabel htmlFor="pet-description">Description</FieldLabel>
          <textarea
            id="pet-description"
            rows={8}
            disabled={disabled}
            aria-invalid={!!errors.description}
            className={PET_FORM_TEXTAREA_CLASS}
            {...register("description")}
          />
          <FieldError errors={[errors.description]} />
        </Field>
      </PetFormSection>
    </div>
  )
}
