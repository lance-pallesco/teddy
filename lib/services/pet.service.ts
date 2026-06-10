import "server-only"

import type { PetStatus, Prisma, Role } from "@prisma/client"

import {
  PET_LIST_PAGE_SIZE,
  PET_SIZE_LABELS,
  PET_SPECIES_LABELS,
} from "@/lib/constants/pet"
import type { PetGender, PetSpecies, PetSize } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { ShelterInactiveError, ShelterNotFoundError } from "@/lib/services/shelter.service"
import { estimatedAgeToBirthDate, formatBirthDateAsAge } from "@/lib/utils/pet-age"
import {
  formatPetAttribution,
  formatPetLocation,
  type PetListFilters,
  type PetListTab,
} from "@/lib/utils/pet-list"
import { canManagePet, isMixedBreedLabel } from "@/lib/utils/pet-permissions"
import { type PetEditSource } from "@/lib/utils/pet-form"
import type { CreatePetInput, UpdatePetInput } from "@/lib/validations/pet"
import {
  deletePetImageFiles,
  PetImageValidationError,
  syncPetImages,
} from "@/lib/services/pet-image.service"
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

export type PetDetailImage = {
  id: string
  url: string
  isPrimary: boolean
}

export type PetDetailShelter = {
  id: string
  name: string
  logo: string | null
  email: string
  phone: string
  city: string
  province: string
  isActive: boolean
}

export type PetDetailOwner = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  avatar: string
  address: string
}

export type PetDetail = {
  id: string
  name: string
  description: string
  species: PetSpecies
  breed: string | null
  isMixedBreed: boolean
  gender: PetGender | null
  size: PetSize
  status: PetStatus
  ageLabel: string
  color: string | null
  weightKg: number | null
  weightLabel: string | null
  tags: string[]
  goodWithKids: boolean
  goodWithDogs: boolean
  goodWithCats: boolean
  isHouseTrained: boolean
  specialNeeds: boolean
  specialNeedsNote: string | null
  postedById: string | null
  shelterId: string | null
  images: PetDetailImage[]
  shelter: PetDetailShelter | null
  postedBy: PetDetailOwner | null
  location: string
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

export class PetNotFoundError extends Error {
  constructor(message = "Pet not found.") {
    super(message)
    this.name = "PetNotFoundError"
  }
}

type CreatePetContext = {
  userId: string
  role: Role
  shelterId: string | null
}

type ManagePetContext = CreatePetContext

type PetOwnershipRef = {
  postedById: string | null
  shelterId: string | null
}

function assertCanManagePet(pet: PetOwnershipRef, context: ManagePetContext) {
  if (
    !canManagePet(pet, {
      id: context.userId,
      role: context.role,
      shelterId: context.shelterId,
    })
  ) {
    throw new PetOwnershipError("You are not allowed to manage this pet.")
  }
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

  if (context.role === "ADOPTER") {
    return { status: "AVAILABLE" }
  }

  return { postedById: context.userId }
}

function buildStatusWhere(context: PetListContext, tab: PetListTab = "active"): Prisma.PetWhereInput {
  if (context.role === "ADOPTER") {
    return { status: "AVAILABLE" }
  }

  if (tab === "archived") {
    return { status: "ARCHIVED" }
  }

  return { status: { not: "ARCHIVED" } }
}

function buildFilterWhere(
  context: PetListContext,
  filters: PetListFilters,
  tab: PetListTab = "active"
): Prisma.PetWhereInput {
  const where: Prisma.PetWhereInput = {
    ...buildStatusWhere(context, tab),
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
  const tab = filters.tab ?? "active"
  const ownershipWhere = buildOwnershipWhere(context)
  const where: Prisma.PetWhereInput = {
    AND: [
      ...(ownershipWhere ? [ownershipWhere] : []),
      buildFilterWhere(context, filters, tab),
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

const petDetailSelect = {
  id: true,
  name: true,
  description: true,
  species: true,
  breed: true,
  gender: true,
  size: true,
  status: true,
  birthDate: true,
  isAgeEstimated: true,
  color: true,
  weightKg: true,
  tags: true,
  goodWithKids: true,
  goodWithDogs: true,
  goodWithCats: true,
  isHouseTrained: true,
  specialNeeds: true,
  specialNeedsNote: true,
  postedById: true,
  shelterId: true,
  petImages: {
    orderBy: [{ isPrimary: "desc" as const }, { createdAt: "asc" as const }],
    select: {
      id: true,
      url: true,
      isPrimary: true,
    },
  },
  shelter: {
    select: {
      id: true,
      name: true,
      logo: true,
      email: true,
      phone: true,
      city: true,
      province: true,
      isActive: true,
    },
  },
  postedBy: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      avatar: true,
      address: true,
    },
  },
} satisfies Prisma.PetSelect

type PetDetailRecord = Prisma.PetGetPayload<{ select: typeof petDetailSelect }>

function mapPetDetailRecord(pet: PetDetailRecord): PetDetail {
  return {
    id: pet.id,
    name: pet.name,
    description: pet.description,
    species: pet.species,
    breed: pet.breed,
    isMixedBreed: isMixedBreedLabel(pet.breed),
    gender: pet.gender,
    size: pet.size,
    status: pet.status,
    ageLabel: formatBirthDateAsAge(pet.birthDate, pet.isAgeEstimated),
    color: pet.color,
    weightKg: pet.weightKg,
    weightLabel: pet.weightKg != null ? `${pet.weightKg} kg` : null,
    tags: pet.tags,
    goodWithKids: pet.goodWithKids,
    goodWithDogs: pet.goodWithDogs,
    goodWithCats: pet.goodWithCats,
    isHouseTrained: pet.isHouseTrained,
    specialNeeds: pet.specialNeeds,
    specialNeedsNote: pet.specialNeedsNote,
    postedById: pet.postedById,
    shelterId: pet.shelterId,
    images: pet.petImages.map((image) => ({
      id: image.id,
      url: image.url,
      isPrimary: image.isPrimary,
    })),
    shelter: pet.shelter,
    postedBy: pet.postedBy,
    location: formatPetLocation({
      shelter: pet.shelter,
      ownerAddress: pet.postedBy?.address,
    }),
  }
}

export async function getPetById(id: string): Promise<PetDetail | null> {
  const pet = await prisma.pet.findUnique({
    where: { id },
    select: petDetailSelect,
  })

  if (!pet) {
    return null
  }

  return mapPetDetailRecord(pet)
}

export async function getRelatedPets(
  pet: Pick<PetDetail, "id" | "shelterId" | "species">,
  limit = 4
): Promise<PetListItem[]> {
  const records = await prisma.pet.findMany({
    where: {
      id: { not: pet.id },
      status: "AVAILABLE",
      OR: [
        ...(pet.shelterId ? [{ shelterId: pet.shelterId }] : []),
        { species: pet.species },
      ],
    },
    select: petListSelect,
    orderBy: { createdAt: "desc" },
    take: limit,
  })

  return records.map(mapPetListRecord)
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

const petEditSelect = {
  id: true,
  name: true,
  description: true,
  species: true,
  breed: true,
  gender: true,
  size: true,
  birthDate: true,
  color: true,
  weightKg: true,
  tags: true,
  goodWithKids: true,
  goodWithDogs: true,
  goodWithCats: true,
  isHouseTrained: true,
  specialNeeds: true,
  specialNeedsNote: true,
  postedById: true,
  shelterId: true,
  status: true,
  petImages: {
    orderBy: [{ isPrimary: "desc" as const }, { createdAt: "asc" as const }],
    select: {
      id: true,
      url: true,
      isPrimary: true,
    },
  },
} satisfies Prisma.PetSelect

type PetEditRecord = Prisma.PetGetPayload<{ select: typeof petEditSelect }>

function mapPetEditRecord(pet: PetEditRecord): PetEditSource {
  return {
    id: pet.id,
    name: pet.name,
    description: pet.description,
    species: pet.species,
    breed: pet.breed,
    gender: pet.gender,
    size: pet.size,
    birthDate: pet.birthDate,
    color: pet.color,
    weightKg: pet.weightKg,
    tags: pet.tags,
    goodWithKids: pet.goodWithKids,
    goodWithDogs: pet.goodWithDogs,
    goodWithCats: pet.goodWithCats,
    isHouseTrained: pet.isHouseTrained,
    specialNeeds: pet.specialNeeds,
    specialNeedsNote: pet.specialNeedsNote,
    images: pet.petImages.map((image) => ({
      id: image.id,
      url: image.url,
      isPrimary: image.isPrimary,
    })),
  }
}

export type PetForEdit = PetEditSource & {
  postedById: string | null
  shelterId: string | null
  status: PetStatus
}

export async function getPetForEdit(id: string): Promise<PetForEdit | null> {
  const pet = await prisma.pet.findUnique({
    where: { id },
    select: petEditSelect,
  })

  if (!pet) {
    return null
  }

  const mapped = mapPetEditRecord(pet)

  return {
    ...mapped,
    postedById: pet.postedById,
    shelterId: pet.shelterId,
    status: pet.status,
  }
}

function buildPetUpdateData(input: UpdatePetInput) {
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
  }
}

export async function updatePet(
  input: UpdatePetInput,
  context: ManagePetContext
): Promise<CreatedPetSummary> {
  const pet = await prisma.pet.findUnique({
    where: { id: input.petId },
    select: { id: true, name: true, postedById: true, shelterId: true },
  })

  if (!pet) {
    throw new PetNotFoundError()
  }

  assertCanManagePet(pet, context)

  const deletedUrls = await prisma.$transaction(async (tx) => {
    await tx.pet.update({
      where: { id: input.petId },
      data: buildPetUpdateData(input),
    })

    return syncPetImages(tx, input.petId, input.photos)
  })

  if (deletedUrls.length > 0) {
    await deletePetImageFiles(deletedUrls)
  }

  return { id: pet.id, name: input.name.trim() }
}

export async function updatePetStatus(
  petId: string,
  archived: boolean,
  context: ManagePetContext
): Promise<CreatedPetSummary> {
  const pet = await prisma.pet.findUnique({
    where: { id: petId },
    select: { id: true, name: true, postedById: true, shelterId: true, status: true },
  })

  if (!pet) {
    throw new PetNotFoundError()
  }

  assertCanManagePet(pet, context)

  const targetStatus = archived ? "ARCHIVED" : "AVAILABLE"

  if (pet.status === targetStatus) {
    return { id: pet.id, name: pet.name }
  }

  const updated = await prisma.pet.update({
    where: { id: petId },
    data: { status: targetStatus },
    select: { id: true, name: true },
  })
  return updated
}