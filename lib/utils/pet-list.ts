import type { PetGender, PetSize, PetSpecies } from "@prisma/client"

import {
  PET_GENDER_VALUES,
  PET_LIST_PAGE_SIZE,
  PET_SIZE_VALUES,
  PET_SPECIES_VALUES,
} from "@/lib/constants/pet"

export type PetListSearchParams = Record<string, string | string[] | undefined>

export type PetListTab = "active" | "archived"

export type PetListFilters = {
  species?: PetSpecies
  size?: PetSize
  gender?: PetGender
  search?: string
  tab?: PetListTab
}

export type ParsedPetListQuery = {
  filters: PetListFilters
  page: number
  pageSize: number
}

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0]
  }

  return value
}

function parseEnumParam<T extends string>(
  value: string | undefined,
  allowed: readonly T[]
): T | undefined {
  if (!value) {
    return undefined
  }

  return allowed.includes(value as T) ? (value as T) : undefined
}

export function parsePetListQuery(
  searchParams: PetListSearchParams,
  pageSize = PET_LIST_PAGE_SIZE
): ParsedPetListQuery {
  const species = parseEnumParam(
    firstParam(searchParams.species),
    PET_SPECIES_VALUES
  )
  const size = parseEnumParam(firstParam(searchParams.size), PET_SIZE_VALUES)
  const gender = parseEnumParam(firstParam(searchParams.gender), PET_GENDER_VALUES)
  const search = firstParam(searchParams.q)?.trim() || undefined
  const tabParam = firstParam(searchParams.tab)
  const tab: PetListTab | undefined =
    tabParam === "archived" ? "archived" : tabParam === "active" ? "active" : undefined

  const rawPage = Number.parseInt(firstParam(searchParams.page) ?? "1", 10)
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1

  return {
    filters: { species, size, gender, search, tab },
    page,
    pageSize,
  }
}

export function buildPetListHref(
  basePath: string,
  filters: PetListFilters,
  page: number
): string {
  const params = new URLSearchParams()

  if (filters.species) {
    params.set("species", filters.species)
  }

  if (filters.size) {
    params.set("size", filters.size)
  }

  if (filters.gender) {
    params.set("gender", filters.gender)
  }

  if (filters.search) {
    params.set("q", filters.search)
  }

  if (filters.tab === "archived") {
    params.set("tab", "archived")
  }

  if (page > 1) {
    params.set("page", String(page))
  }

  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

export function formatPetLocation(input: {
  shelter?: { city: string; province: string } | null
  ownerAddress?: string | null
}): string {
  if (input.shelter) {
    return `${input.shelter.city}, ${input.shelter.province}`
  }

  const address = input.ownerAddress?.trim()

  if (!address) {
    return "Location unavailable"
  }

  if (address.length <= 48) {
    return address
  }

  return `${address.slice(0, 45)}…`
}

export function formatPetAttribution(pet: {
  shelter?: { name: string; isActive: boolean } | null
  postedBy?: { firstName: string; lastName: string } | null
}): { label: string; isShelter: boolean; isVerified: boolean } {
  if (pet.shelter) {
    return {
      label: pet.shelter.name,
      isShelter: true,
      isVerified: pet.shelter.isActive,
    }
  }

  if (pet.postedBy) {
    return {
      label: `${pet.postedBy.firstName} ${pet.postedBy.lastName}`.trim(),
      isShelter: false,
      isVerified: false,
    }
  }

  return {
    label: "Unknown poster",
    isShelter: false,
    isVerified: false,
  }
}
