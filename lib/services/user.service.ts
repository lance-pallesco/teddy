import { Prisma, type Gender, type Role } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import type { RegisterInput } from "@/lib/validations/auth"

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
  createdAt: Date
  updatedAt: Date
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
  const role: Extract<Role, "ADOPTER" | "RESCUER"> =
    input.role === "RESCUER" ? "RESCUER" : "ADOPTER"

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
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new DuplicateUserError()
    }

    throw error
  }
}
