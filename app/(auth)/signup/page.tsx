import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth/session"
import { SignupForm } from "@/components/SignupForm"
import Image from "next/image"
import Link from "next/link"

export default async function SignupPage() {
  const user = await getCurrentUser()
  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/login" className="flex items-center gap-2 font-medium">
            <Image src="/logo.png" alt="Teddy logo" width={56} height={56} priority />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <SignupForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block" />
    </div>
  )
}
