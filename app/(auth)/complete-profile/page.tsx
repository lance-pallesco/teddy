import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { jwtVerify } from "jose"

import { CompleteProfileForm } from "@/components/CompleteProfileForm"

type CompleteProfilePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function CompleteProfilePage({}: CompleteProfilePageProps) {
  const cookieStore = await cookies()
  const tempToken = cookieStore.get("oauth_signup_state")?.value

  if (!tempToken) {
    redirect("/login")
  }

  const secret = process.env.JWT_SECRET ?? process.env.AUTH_SECRET
  if (!secret) {
    throw new Error("JWT_SECRET or AUTH_SECRET must be configured")
  }

  let profileData = { email: "", firstName: "", lastName: "", avatar: "" }

  try {
    const { payload } = await jwtVerify(
      tempToken,
      new TextEncoder().encode(secret)
    )
    profileData = payload as typeof profileData
  } catch (error) {
    console.error("Failed to verify oauth_signup_state token:", error)
    redirect("/login?error=session_expired")
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10 bg-slate-50 dark:bg-zinc-900">
      <div className="w-full max-w-xl">
        <CompleteProfileForm defaultProfile={profileData} />
      </div>
    </div>
  )
}
