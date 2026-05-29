"use server"

import bcrypt from "bcryptjs"

import {
  createUser,
  DuplicateUserError,
  type PublicUser,
} from "@/lib/services/user.service"
import { registerSchema } from "@/lib/validations/auth"

type RegisterResponse = {
  success: boolean
  message: string
  data?: PublicUser
}

export async function registerUser(input: unknown): Promise<RegisterResponse> {
  const parsed = registerSchema.safeParse(input)

  if (!parsed.success) {
    return {
      success: false,
      message: "Please check your registration details and try again.",
    }
  }

  try {
    const passwordHash = await bcrypt.hash(parsed.data.password, 12)
    const user = await createUser({
      ...parsed.data,
      passwordHash,
    })

    return {
      success: true,
      message: "Account created successfully",
      data: user,
    }
  } catch (error) {
    console.error("REGISTER ERROR:", error)
    if (error instanceof DuplicateUserError) {
      return {
        success: false,
        message: "Unable to create an account with the provided information.",
      }
    }

    return {
      success: false,
      message: "Unable to create account. Please try again later.",
    }
  }
}
