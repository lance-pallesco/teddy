import { redirect } from "next/navigation"

import { getCurrentUser } from "@/lib/auth/session"
import { getUserProfile } from "@/lib/services/user.service"
import { PageHeader } from "@/components/dashboard/page-header"
import { ProfileForm } from "@/components/profile/profile-form"
import { PasswordForm } from "@/components/profile/password-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default async function ProfilePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const profile = await getUserProfile(user.id)

  if (!profile) {
    redirect("/login")
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 mx-auto w-full">
      <PageHeader
        title="Profile Settings"
        subtitle="Manage your personal details, avatar, and security preferences."
      />

      <div className="grid gap-6 lg:grid-cols-3 items-start">
        {/* Personal Information */}
        <Card className="shadow-sm border lg:col-span-2">
          <CardHeader className="p-6 pb-4 border-b">
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your personal details, contact info, and gender.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <ProfileForm user={profile} />
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card className="shadow-sm border lg:col-span-1">
          <CardHeader className="p-6 pb-4 border-b">
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your account password to keep your account secure.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <PasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
