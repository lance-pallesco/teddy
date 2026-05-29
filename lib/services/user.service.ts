import { Prisma, type Gender, type Role } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import type { RegisterInput } from "@/lib/validations/auth"
import { ShelterInactiveError, ShelterNotFoundError } from "@/lib/services/shelter.service"

export type PublicUser = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  gender: Gender
  address: string
  role: Role
  isActive: boolean
  shelterId: string | null
  createdAt: Date
  updatedAt: Date
}

export type ShelterStaffListItem = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  isActive: boolean
  shelterId: string | null
  shelterName: string | null
  createdAt: Date
}

export class DuplicateUserError extends Error {
  constructor() {
    super("Duplicate user")
    this.name = "DuplicateUserError"
  }
}

const userSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  gender: true,
  address: true,
  role: true,
  isActive: true,
  shelterId: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect

function toGender(value: string): Gender {
  if (value === "MALE" || value === "FEMALE" || value === "OTHER") {
    return value
  }

  return "OTHER"
}

export async function createUser(input: RegisterInput & { passwordHash: string }): Promise<PublicUser> {
  const role: Extract<Role, "ADOPTER" | "PET_OWNER"> =
    input.role === "PET_OWNER" ? "PET_OWNER" : "ADOPTER"

  const [emailUser, phoneUser] = await Promise.all([
    prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true },
    }),
    prisma.user.findUnique({
      where: { phone: input.phone },
      select: { id: true },
    }),
  ])

  if (emailUser || phoneUser) {
    throw new DuplicateUserError()
  }

  try {
    return await prisma.user.create({
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone,
        gender: toGender(input.gender),
        address: input.address,
        password: input.passwordHash,
        role,
        avatar: "",
      },
      select: userSelect,
    })
  } catch (error) {
    console.log("CREATE USER ERROR:", error)
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new DuplicateUserError()
    }

    throw error
  }
}

export async function createShelterStaffUser(input: {
  firstName: string
  lastName: string
  email: string
  phone: string
  gender: string
  address: string
  passwordHash: string
  shelterId: string
}): Promise<PublicUser> {
  const shelter = await prisma.shelter.findUnique({
    where: { id: input.shelterId },
    select: { id: true, isActive: true },
  })

  if (!shelter) {
    throw new ShelterNotFoundError()
  }

  if (!shelter.isActive) {
    throw new ShelterInactiveError()
  }

  const [emailUser, phoneUser] = await Promise.all([
    prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true },
    }),
    prisma.user.findUnique({
      where: { phone: input.phone },
      select: { id: true },
    }),
  ])

  if (emailUser || phoneUser) {
    throw new DuplicateUserError()
  }

  try {
    return await prisma.user.create({
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone,
        gender: toGender(input.gender),
        address: input.address,
        password: input.passwordHash,
        role: "SHELTER_STAFF",
        shelterId: shelter.id,
        avatar: "",
      },
      select: userSelect,
    })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new DuplicateUserError()
    }

    throw error
  }
}

export async function listShelterStaff(options?: { shelterId?: string }) {
  const users = await prisma.user.findMany({
    where: {
      role: "SHELTER_STAFF",
      ...(options?.shelterId ? { shelterId: options.shelterId } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      isActive: true,
      shelterId: true,
      createdAt: true,
      shelter: {
        select: { name: true },
      },
    },
  })

  return users.map<ShelterStaffListItem>((user) => ({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    isActive: user.isActive,
    shelterId: user.shelterId,
    shelterName: user.shelter?.name ?? null,
    createdAt: user.createdAt,
  }))
}
