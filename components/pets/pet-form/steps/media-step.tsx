"use client"

import { useEffect, useMemo, useState } from "react"
import { useFormContext, useWatch } from "react-hook-form"

import { PetPhotoUploader, type PetPhotoItem } from "@/components/pets/pet-photo-uploader"
import { usePetFormContext } from "@/components/pets/pet-form/pet-form-provider"
import { PetFormSection } from "@/components/pets/pet-form/pet-form-section"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { buildDefaultPetDescription } from "@/lib/utils/pet-description"
import type { PetFormInput } from "@/lib/validations/pet"

type MediaStepProps = {
  disabled?: boolean
}

function photosToPhotoItems(
  photos: NonNullable<PetFormInput["photos"]>
): PetPhotoItem[] {
  return photos.map((photo) => ({
    id: photo.imageId ?? photo.url,
    imageId: photo.imageId,
    url: photo.url,
  }))
}

function yesNoToBoolean(value: PetFormInput["goodWithKids"]): boolean {
  return value === "YES"
}

export function MediaStep({ disabled }: MediaStepProps) {
  const { mode } = usePetFormContext()
  const {
    register,
    setValue,
    control,
    getValues,
    formState: { errors, dirtyFields },
  } = useFormContext<PetFormInput>()

  const photos = useWatch({ control, name: "photos" }) ?? []
  const values = useWatch({ control })

  const [photoItems, setPhotoItems] = useState<PetPhotoItem[]>(() =>
    photosToPhotoItems(photos)
  )

  const syncedPhotos = useMemo(
    () =>
      photoItems
        .filter((item) => item.url && !item.isUploading)
        .map((item) => ({
          imageId: item.imageId,
          url: item.url,
        })),
    [photoItems]
  )

  useEffect(() => {
    setValue("photos", syncedPhotos, { shouldDirty: true, shouldValidate: true })
  }, [setValue, syncedPhotos])

  useEffect(() => {
    if (mode === "edit" || dirtyFields.description) {
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
  }, [dirtyFields.description, getValues, mode, setValue, values])

  const isUploading = photoItems.some((item) => item.isUploading)

  return (
    <div className="flex flex-col gap-6">
      <PetFormSection
        title="Photos"
        description="The first photo is used as the primary listing image. Reorder or set primary below."
      >
        <Field>
          <FieldLabel>Pet photos</FieldLabel>
          <PetPhotoUploader
            value={photoItems}
            disabled={disabled || isUploading}
            onChange={setPhotoItems}
          />
          <FieldDescription>At least one photo is required.</FieldDescription>
          <FieldError errors={[errors.photos]} />
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
            {...register("description")}
          />
          <FieldError errors={[errors.description]} />
        </Field>
      </PetFormSection>
    </div>
  )
}
