"use server"

import { cookies } from "next/headers"

import {
  AUTH_COOKIE_NAME,
  getAuthCookieOptions,
  isAuthTokenConfigured,
  signAuthToken,
} from "@/lib/auth/jwt"
import { authenticateUser } from "@/lib/services/auth.service"
import { loginSchema } from "@/lib/validations/auth"

type LoginResponse = {
  success: boolean
  message: string
}

const GENERIC_LOGIN_ERROR = "Invalid credentials!"
const LOCKED_LOGIN_ERROR = "Your account is temporarily locked. Please try again later."
const INACTIVE_LOGIN_ERROR = "Your account is inactive. Please contact support."
const SESSION_ERROR = "Unable to start your session. Please try again."

export async function loginUser(input: unknown): Promise<LoginResponse> {
  const parsed = loginSchema.safeParse(input)

  if (!parsed.success) {
    return {
      success: false,
      message: GENERIC_LOGIN_ERROR,
    }
  }

  const result = await authenticateUser(parsed.data).catch(() => null)

  if (!result) {
    return {
      success: false,
      message: SESSION_ERROR,
    }
  }

  if (result.status === "invalid") {
    return {
      success: false,
      message: GENERIC_LOGIN_ERROR,
    }
  }

  if (result.status === "locked") {
    return {
      success: false,
      message: LOCKED_LOGIN_ERROR,
    }
  }

  if (result.status === "inactive") {
    return {
      success: false,
      message: INACTIVE_LOGIN_ERROR,
    }
  }

  if (!isAuthTokenConfigured()) {
    return {
      success: false,
      message: SESSION_ERROR,
    }
  }

  const { user } = result

  try {
    const token = await signAuthToken({
      userId: user.id,
      role: user.role,
      firstName: user.firstName,
      shelterId: user.shelterId,
    })

    const cookieStore = await cookies()
    cookieStore.set(AUTH_COOKIE_NAME, token, getAuthCookieOptions())

    return {
      success: true,
      message: "Login successful",
    }
  } catch {
    return {
      success: false,
      message: SESSION_ERROR,
    }
  }
}
