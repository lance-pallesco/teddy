import "server-only"

import type { PetStatus, Prisma, Role } from "@prisma/client"

import {
  PET_LIST_PAGE_SIZE,
  PET_SIZE_LABELS,
  PET_SPECIES_LABELS,
} from "@/lib/constants/pet"
import type { PetSpecies, PetSize } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { ShelterInactiveError, ShelterNotFoundError } from "@/lib/services/shelter.service"
import { estimatedAgeToBirthDate, formatBirthDateAsAge } from "@/lib/utils/pet-age"
import {
  formatPetAttribution,
  formatPetLocation,
  type PetListFilters,
} from "@/lib/utils/pet-list"
import type { CreatePetInput } from "@/lib/validations/pet"
export type CreatedPetSummary = {
  id: string
  name: string
}

export type PetListItem = {
  id: string
  name: string
  species: string
  breed: string | null
  gender: string | null
  size: string
  status: PetStatus
  ageLabel: string
  speciesBreed: string
  sizeLabel: string
  primaryImageUrl: string | null
  attribution: {
    label: string
    isShelter: boolean
    isVerified: boolean
  }
  location: string
}

export type PetListResult = {
  pets: PetListItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

type PetListContext = {
  userId: string
  role: Role
  shelterId: string | null
}
export class PetOwnershipError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "PetOwnershipError"
  }
}

type CreatePetContext = {
  userId: string
  role: Role
  shelterId: string | null
}

function emptyToNull(value?: string | null): string | null {
  return value?.trim() ? value.trim() : null
}

function parseWeightKg(weightKg: CreatePetInput["weightKg"]): number | null {
  if (weightKg === "" || weightKg == null) {
    return null
  }

  return typeof weightKg === "number" ? weightKg : null
}

async function resolveShelterId(role: Role, shelterId: string | null): Promise<string | null> {
  if (role === "PET_OWNER") {
    return null
  }

  if (role !== "SHELTER_STAFF") {
    throw new PetOwnershipError("You are not allowed to create pets.")
  }

  if (!shelterId) {
    throw new PetOwnershipError("Your account is not linked to a shelter.")
  }

  const shelter = await prisma.shelter.findUnique({
    where: { id: shelterId },
    select: { id: true, isActive: true },
  })

  if (!shelter) {
    throw new ShelterNotFoundError()
  }

  if (!shelter.isActive) {
    throw new ShelterInactiveError()
  }

  return shelter.id
}

function buildPetCreateData(input: CreatePetInput, context: CreatePetContext, shelterId: string | null) {
  return {
    name: input.name.trim(),
    description: input.description.trim(),
    species: input.species,
    breed: emptyToNull(input.breed),
    gender: input.gender,
    size: input.size,
    birthDate: estimatedAgeToBirthDate(input.age, input.ageUnit),
    isAgeEstimated: true,
    color: emptyToNull(input.color),
    weightKg: parseWeightKg(input.weightKg),
    tags: input.tags,
    goodWithKids: input.goodWithKids,
    goodWithDogs: input.goodWithDogs,
    goodWithCats: input.goodWithCats,
    isHouseTrained: input.isHouseTrained,
    specialNeeds: input.specialNeeds,
    specialNeedsNote: input.specialNeeds ? emptyToNull(input.specialNeedsNote) : null,
    ...(shelterId ? { shelter: { connect: { id: shelterId } } } : {}),
    postedBy: { connect: { id: context.userId } },
  }
}

export async function createPetForUser(
  input: CreatePetInput,
  context: CreatePetContext
): Promise<CreatedPetSummary> {
  const shelterId = await resolveShelterId(context.role, context.shelterId)
  const imageUrls = [...new Set(input.imageUrls)]

  return prisma.$transaction(async (tx) => {
    const pet = await tx.pet.create({
      data: buildPetCreateData(input, context, shelterId),
      select: { id: true, name: true },
    })

    await tx.petImage.createMany({
      data: imageUrls.map((url, index) => ({
        petId: pet.id,
        url,
        isPrimary: index === 0,
      })),
    })

    return pet
  })
}

const petListSelect = {
  id: true,
  name: true,
  species: true,
  breed: true,
  gender: true,
  size: true,
  status: true,
  birthDate: true,
  isAgeEstimated: true,
  shelter: {
    select: {
      name: true,
      isActive: true,
      city: true,
      province: true,
    },
  },
  postedBy: {
    select: {
      firstName: true,
      lastName: true,
      address: true,
    },
  },
  petImages: {
    where: { isPrimary: true },
    take: 1,
    select: { url: true },
  },
} satisfies Prisma.PetSelect

type PetListRecord = Prisma.PetGetPayload<{ select: typeof petListSelect }>

function buildOwnershipWhere(context: PetListContext): Prisma.PetWhereInput | null {
  if (context.role === "ADMIN") {
    return null
  }

  if (context.role === "SHELTER_STAFF" && context.shelterId) {
    return { shelterId: context.shelterId }
  }

  if (context.role === "PET_OWNER") {
    return { postedById: context.userId }
  }

  return { postedById: context.userId }
}

function buildFilterWhere(filters: PetListFilters): Prisma.PetWhereInput {
  const where: Prisma.PetWhereInput = {
    status: "AVAILABLE",
  }

  if (filters.species) {
    where.species = filters.species
  }

  if (filters.size) {
    where.size = filters.size
  }

  if (filters.gender) {
    where.gender = filters.gender
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { breed: { contains: filters.search, mode: "insensitive" } },
    ]
  }

  return where
}

function mapPetListRecord(pet: PetListRecord): PetListItem {
  const primaryImage = pet.petImages[0]?.url ?? null
  const attribution = formatPetAttribution({
    shelter: pet.shelter,
    postedBy: pet.postedBy,
  })

  const speciesLabel = PET_SPECIES_LABELS[pet.species as PetSpecies]
  const breedLabel = pet.breed?.trim() || "Breed not listed"

  return {
    id: pet.id,
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    gender: pet.gender,
    size: pet.size,
    status: pet.status,
    ageLabel: formatBirthDateAsAge(pet.birthDate, pet.isAgeEstimated),
    speciesBreed: `${speciesLabel} • ${breedLabel}`,
    sizeLabel: PET_SIZE_LABELS[pet.size as PetSize],
    primaryImageUrl: primaryImage,
    attribution,
    location: formatPetLocation({
      shelter: pet.shelter,
      ownerAddress: pet.postedBy?.address,
    }),
  }
}

export async function getPets(
  context: PetListContext,
  filters: PetListFilters,
  page: number,
  pageSize = PET_LIST_PAGE_SIZE
): Promise<PetListResult> {
  const ownershipWhere = buildOwnershipWhere(context)
  const where: Prisma.PetWhereInput = {
    AND: [
      ...(ownershipWhere ? [ownershipWhere] : []),
      buildFilterWhere(filters),
    ],
  }

  const skip = (page - 1) * pageSize

  const [total, records] = await Promise.all([
    prisma.pet.count({ where }),
    prisma.pet.findMany({
      where,
      select: petListSelect,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return {
    pets: records.map(mapPetListRecord),
    total,
    page,
    pageSize,
    totalPages,
  }
}

export async function getShelterPets(
  shelterId: string,
  page = 1,
  pageSize = PET_LIST_PAGE_SIZE
): Promise<PetListResult> {
  const where: Prisma.PetWhereInput = { shelterId }
  const skip = (page - 1) * pageSize

  const [total, records] = await Promise.all([
    prisma.pet.count({ where }),
    prisma.pet.findMany({
      where,
      select: petListSelect,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return {
    pets: records.map(mapPetListRecord),
    total,
    page,
    pageSize,
    totalPages,
  }
}