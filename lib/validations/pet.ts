import { z } from "zod"

import {
  MAX_PET_IMAGES,
  PET_AGE_UNIT_VALUES,
  PET_GENDER_VALUES,
  PET_SIZE_VALUES,
  PET_SPECIES_VALUES,
  PET_TEMPERAMENT_VALUES,
  PET_YES_NO_VALUES,
} from "@/lib/constants/pet"

const optionalTrimmedText = (max: number, message: string) =>
  z
    .string()
    .trim()
    .max(max, message)
    .optional()
    .or(z.literal(""))

const petImageUrlSchema = z
  .string()
  .trim()
  .refine(
    (value) => value.startsWith("/uploads/pets/") || /^https?:\/\//i.test(value),
    "Image must be a valid uploaded URL"
  )

const speciesSchema = z.enum(PET_SPECIES_VALUES, { error: "Select a species" })
const genderSchema = z.enum(PET_GENDER_VALUES, { error: "Select a gender" })
const sizeSchema = z.enum(PET_SIZE_VALUES, { error: "Select a size" })
const ageUnitSchema = z.enum(PET_AGE_UNIT_VALUES, { error: "Select an age unit" })
const temperamentSchema = z.enum(PET_TEMPERAMENT_VALUES)
const yesNoSchema = z.enum(PET_YES_NO_VALUES, { error: "Select yes or no" })

const weightKgSchema = z
  .union([
    z.literal(""),
    z.coerce
      .number()
      .positive("Weight must be greater than zero")
      .max(200, "Weight must be 200 kg or less"),
  ])
  .optional()

export const petDetailsStepSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80, "Name is too long"),
  species: speciesSchema,
  breed: optionalTrimmedText(80, "Breed must be 80 characters or fewer"),
  age: z.coerce
    .number()
    .int("Age must be a whole number")
    .positive("Age must be at least 1")
    .max(30, "Age must be 30 or less"),
  ageUnit: ageUnitSchema,
  gender: genderSchema,
  size: sizeSchema,
  color: optionalTrimmedText(60, "Color must be 60 characters or fewer"),
  weightKg: weightKgSchema,
})

// 1. Keep the base object schema separate
export const petCareStepObjectSchema = z.object({
  tags: z
    .array(temperamentSchema)
    .min(1, "Select at least one temperament")
    .max(PET_TEMPERAMENT_VALUES.length, "Too many temperament tags selected"),
  goodWithKids: yesNoSchema,
  goodWithDogs: yesNoSchema,
  goodWithCats: yesNoSchema,
  isHouseTrained: yesNoSchema,
  specialNeeds: yesNoSchema,
  specialNeedsNote: optionalTrimmedText(1000, "Special needs note is too long"),
})

// 2. Refine the care step separately for step-level form validation
export const petCareStepSchema = petCareStepObjectSchema.superRefine((data, ctx) => {
  if (data.specialNeeds === "YES" && !data.specialNeedsNote?.trim()) {
    ctx.addIssue({
      code: "custom",
      message: "Describe the special needs when you answer yes",
      path: ["specialNeedsNote"],
    })
  }
})

export const petPhotoFormSchema = z.object({
  imageId: z.string().uuid().optional(),
  url: petImageUrlSchema,
})

export const petMediaStepSchema = z.object({
  photos: z
    .array(petPhotoFormSchema)
    .min(1, "Add at least one photo")
    .max(MAX_PET_IMAGES, `Maximum ${MAX_PET_IMAGES} images`),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be 2000 characters or fewer"),
})

// 3. Merge pure object schemas, then apply the refinement to the resulting schema
export const petFormSchema = petDetailsStepSchema
  .merge(petCareStepObjectSchema)
  .merge(petMediaStepSchema)
  .superRefine((data, ctx) => {
    if (data.specialNeeds === "YES" && !data.specialNeedsNote?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Describe the special needs when you answer yes",
        path: ["specialNeedsNote"],
      })
    }
  })

function yesNoToBoolean(value: z.infer<typeof yesNoSchema>): boolean {
  return value === "YES"
}

function transformPetFormFields(data: z.infer<typeof petFormSchema>) {
  return {
    name: data.name,
    species: data.species,
    breed: data.breed,
    age: data.age,
    ageUnit: data.ageUnit,
    gender: data.gender,
    size: data.size,
    color: data.color,
    weightKg: data.weightKg,
    tags: data.tags,
    goodWithKids: yesNoToBoolean(data.goodWithKids),
    goodWithDogs: yesNoToBoolean(data.goodWithDogs),
    goodWithCats: yesNoToBoolean(data.goodWithCats),
    isHouseTrained: yesNoToBoolean(data.isHouseTrained),
    specialNeeds: yesNoToBoolean(data.specialNeeds),
    specialNeedsNote: data.specialNeedsNote,
    photos: data.photos.map((photo) => ({
      imageId: photo.imageId,
      url: photo.url,
    })),
    imageUrls: data.photos.map((photo) => photo.url),
    description: data.description,
  }
}

export const createPetSchema = petFormSchema.transform(transformPetFormFields)

export const updatePetSchema = petFormSchema
  .extend({
    petId: z.string().uuid("Invalid pet id"),
  })
  .transform((data) => ({
    petId: data.petId,
    ...transformPetFormFields(data),
  }))

export type CreatePetInput = z.output<typeof createPetSchema>
export type UpdatePetInput = z.output<typeof updatePetSchema>
export type PetFormInput = z.input<typeof petFormSchema>
/** @deprecated Use PetFormInput */
export type CreatePetFormInput = PetFormInput

export const emptyCreatePetFormValues: CreatePetFormInput = {
  name: "",
  species: "DOG",
  breed: "",
  age: 1,
  ageUnit: "YEARS",
  gender: "MALE",
  size: "MEDIUM",
  color: "",
  weightKg: "",
  tags: [],
  goodWithKids: "NO",
  goodWithDogs: "NO",
  goodWithCats: "NO",
  isHouseTrained: "NO",
  specialNeeds: "NO",
  specialNeedsNote: "",
  photos: [],
  description: "",
}

export const PET_FORM_STEP_SCHEMAS = {
  details: petDetailsStepSchema,
  care: petCareStepSchema,
  media: petMediaStepSchema,
} as const