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
