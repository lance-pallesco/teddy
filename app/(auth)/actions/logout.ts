"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { AUTH_COOKIE_NAME } from "@/lib/auth/jwt"

export async function logoutUser() {
  ;(await cookies()).delete(AUTH_COOKIE_NAME)
  redirect("/login")
}
