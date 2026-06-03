import type { PetGender, PetSize, PetSpecies, PetStatus } from "@prisma/client"

export const PET_SPECIES_VALUES = [
  "DOG",
  "CAT",
  "RABBIT",
  "BIRD",
  "OTHER",
] as const satisfies readonly PetSpecies[]

export const PET_SIZE_VALUES = [
  "SMALL",
  "MEDIUM",
  "LARGE",
  "EXTRA_LARGE",
] as const satisfies readonly PetSize[]

export const PET_GENDER_VALUES = ["MALE", "FEMALE"] as const satisfies readonly PetGender[]

export const PET_AGE_UNIT_VALUES = ["MONTHS", "YEARS"] as const

export type PetAgeUnit = (typeof PET_AGE_UNIT_VALUES)[number]

export const PET_YES_NO_VALUES = ["YES", "NO"] as const

export type PetYesNoValue = (typeof PET_YES_NO_VALUES)[number]

/** Temperament tags — aligned with Pet.tags filtering for public browse. */
export const PET_TEMPERAMENT_VALUES = [
  "Playful",
  "Gentle",
  "Calm",
  "Energetic",
  "Friendly",
  "Shy",
  "Independent",
  "Affectionate",
  "Social",
] as const

export type PetTemperament = (typeof PET_TEMPERAMENT_VALUES)[number]

export const MAX_PET_IMAGES = 8

export const PET_LIST_PAGE_SIZE = 12

export const PET_STATUS_VALUES = [
  "AVAILABLE",
  "PENDING",
  "ADOPTED",
  "RESERVED",
  "MEDICAL_HOLD",
  "ARCHIVED",
] as const satisfies readonly PetStatus[]

export const PET_STATUS_LABELS: Record<PetStatus, string> = {
  AVAILABLE: "Available",
  PENDING: "Pending",
  ADOPTED: "Adopted",
  RESERVED: "Reserved",
  MEDICAL_HOLD: "Medical hold",
  ARCHIVED: "Archived",
}

export type PetStatusBadgeVariant = "success" | "secondary" | "warning" | "danger" | "outline"

export const PET_STATUS_BADGE_VARIANT: Record<PetStatus, PetStatusBadgeVariant> = {
  AVAILABLE: "success",
  PENDING: "warning",
  ADOPTED: "secondary",
  RESERVED: "warning",
  MEDICAL_HOLD: "outline",
  ARCHIVED: "secondary",
}

export const PET_FILTER_ALL = "ALL" as const

export const PET_SPECIES_LABELS: Record<PetSpecies, string> = {
  DOG: "Dog",
  CAT: "Cat",
  RABBIT: "Rabbit",
  BIRD: "Bird",
  OTHER: "Other",
}

/** Display labels include typical weight ranges for adopters. */
export const PET_SIZE_OPTIONS: { value: PetSize; label: string }[] = [
  { value: "SMALL", label: "Small (up to 15 kg)" },
  { value: "MEDIUM", label: "Medium (16–25 kg)" },
  { value: "LARGE", label: "Large (26–40 kg)" },
  { value: "EXTRA_LARGE", label: "Extra large (41+ kg)" },
]

export const PET_SIZE_LABELS: Record<PetSize, string> = Object.fromEntries(
  PET_SIZE_OPTIONS.map(({ value, label }) => [value, label.split(" (")[0] ?? label])
) as Record<PetSize, string>

export const PET_GENDER_LABELS: Record<PetGender, string> = {
  MALE: "Male",
  FEMALE: "Female",
}

export const PET_AGE_UNIT_LABELS: Record<PetAgeUnit, string> = {
  MONTHS: "Months",
  YEARS: "Years",
}

export const PET_YES_NO_LABELS: Record<PetYesNoValue, string> = {
  YES: "Yes",
  NO: "No",
}

export const PET_FORM_STEPS = [
  {
    id: "details",
    title: "Pet details",
    description: "Name, species, size, and appearance",
  },
  {
    id: "care",
    title: "Behavior & care",
    description: "Temperament, compatibility, and special needs",
  },
  {
    id: "media",
    title: "Photos & listing",
    description: "Images and public description",
  },
] as const

export type PetFormStepId = (typeof PET_FORM_STEPS)[number]["id"]

/** Shared control sizing for the add-pet wizard. */
export const PET_FORM_INPUT_CLASS = "h-11 w-full text-base"
export const PET_FORM_SELECT_TRIGGER_CLASS =
  "h-11 w-full text-base [&_[data-slot=select-value]]:line-clamp-1"
export const PET_FORM_TEXTAREA_CLASS =
  "min-h-36 w-full rounded-md border border-input bg-transparent px-3 py-2.5 text-base shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20"
