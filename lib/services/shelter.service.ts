import { Prisma } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import { generateSlug } from "@/lib/utils/generate-slug"
import type { CreateShelterInput, ShelterFieldsInput } from "@/lib/validations/shelter"

export type ShelterListItem = {
  id: string
  name: string
  slug: string
  logo: string | null
  city: string
  province: string
  phone: string
  email: string
  isActive: boolean
  createdAt: Date
}

export type ShelterFormRecord = {
  id: string
  name: string
  description: string
  logo: string | null
  address: string
  barangay: string | null
  city: string
  province: string
  postalCode: string | null
  phone: string
  email: string
  isActive: boolean
}

export class DuplicateShelterError extends Error {
  constructor() {
    super("Duplicate shelter")
    this.name = "DuplicateShelterError"
  }
}

export class ShelterNotFoundError extends Error {
  constructor() {
    super("Shelter not found")
    this.name = "ShelterNotFoundError"
  }
}

export class ShelterInactiveError extends Error {
  constructor() {
    super("Shelter is inactive")
    this.name = "ShelterInactiveError"
  }
}

function emptyToNull(value?: string) {
  return value?.trim() ? value.trim() : null
}

async function createUniqueSlug(name: string, excludeShelterId?: string) {
  const baseSlug = generateSlug(name) || "shelter"
  let slug = baseSlug
  let suffix = 1

  while (true) {
    const existing = await prisma.shelter.findUnique({
      where: { slug },
      select: { id: true },
    })

    if (!existing || existing.id === excludeShelterId) {
      return slug
    }

    slug = `${baseSlug}-${suffix}`
    suffix += 1
  }
}

const shelterFormSelect = {
  id: true,
  name: true,
  description: true,
  logo: true,
  address: true,
  barangay: true,
  city: true,
  province: true,
  postalCode: true,
  phone: true,
  email: true,
  isActive: true,
} as const

const shelterListSelect = {
  id: true,
  name: true,
  slug: true,
  logo: true,
  city: true,
  province: true,
  phone: true,
  email: true,
  isActive: true,
  createdAt: true,
} as const

function buildShelterData(input: ShelterFieldsInput) {
  return {
    name: input.name,
    description: input.description,
    logo: emptyToNull(input.logo),
    address: input.address,
    barangay: emptyToNull(input.barangay),
    city: input.city,
    province: input.province,
    postalCode: emptyToNull(input.postalCode),
    phone: input.phone,
    email: input.email,
  }
}

export async function listShelters(): Promise<ShelterListItem[]> {
  return prisma.shelter.findMany({
    orderBy: { createdAt: "desc" },
    select: shelterListSelect,
  })
}

export async function getShelterById(id: string): Promise<ShelterFormRecord | null> {
  const shelter = await prisma.shelter.findUnique({
    where: { id },
    select: shelterFormSelect,
  })

  return shelter
}

export async function getShelterNameById(id: string): Promise<string | null> {
  const shelter = await prisma.shelter.findUnique({
    where: { id },
    select: { name: true },
  })

  return shelter?.name ?? null
}

export async function isShelterActive(id: string): Promise<boolean> {
  const shelter = await prisma.shelter.findUnique({
    where: { id },
    select: { isActive: true },
  })

  return shelter?.isActive ?? false
}

export type ActiveShelterOption = {
  id: string
  name: string
}

export async function listActiveShelterOptions(): Promise<ActiveShelterOption[]> {
  return prisma.shelter.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  })
}

export async function toggleShelterStatus(id: string) {
  const shelter = await prisma.shelter.findUnique({
    where: { id },
    select: { id: true, isActive: true },
  })

  if (!shelter) {
    throw new ShelterNotFoundError()
  }

  const nextIsActive = !shelter.isActive

  // TODO(MVP): When public pet browsing is implemented, ensure deactivated shelters
  // are excluded from public listings and detail pages.
  // TODO(MVP): When SHELTER_STAFF auth/ops are implemented, block staff login and
  // staff operations for deactivated shelters.

  return prisma.shelter.update({
    where: { id },
    data: { isActive: nextIsActive },
    select: { id: true, isActive: true },
  })
}

export async function createShelter(input: CreateShelterInput) {
  const slug = await createUniqueSlug(input.name)

  try {
    return await prisma.shelter.create({
      data: {
        ...buildShelterData(input),
        slug,
      },
      select: shelterListSelect,
    })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new DuplicateShelterError()
    }

    throw error
  }
}

export async function updateShelter(id: string, input: ShelterFieldsInput) {
  const existing = await prisma.shelter.findUnique({
    where: { id },
    select: { id: true, name: true, slug: true },
  })

  if (!existing) {
    throw new ShelterNotFoundError()
  }

  const slug =
    input.name.trim() === existing.name.trim()
      ? existing.slug
      : await createUniqueSlug(input.name, id)

  try {
    return await prisma.shelter.update({
      where: { id },
      data: {
        ...buildShelterData(input),
        slug,
      },
      select: shelterListSelect,
    })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new DuplicateShelterError()
    }

    throw error
  }
}
