import { redirect } from "next/navigation"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getCurrentUser } from "@/lib/auth/session"

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export default async function ProfilePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const name = `${user.firstName} ${user.lastName}`

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Static account settings preview. Editing arrives in a later MVP.
        </p>
      </div>
      <section className="rounded-lg border p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <Avatar className="size-20 rounded-xl">
            <AvatarImage src={user.avatar || undefined} alt={name} />
            <AvatarFallback className="rounded-xl text-lg">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h2 className="text-lg font-medium">{name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Role: {user.role.replace("_", " ")}
            </p>
          </div>
        </div>
      </section>
      <section className="rounded-lg border p-6">
        <h2 className="text-base font-medium">Basic Account Information</h2>
        <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground">First name</p>
            <p className="font-medium">{user.firstName}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Last name</p>
            <p className="font-medium">{user.lastName}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Role</p>
            <p className="font-medium">{user.role.replace("_", " ")}</p>
          </div>
        </div>
      </section>
    </div>
  )
}
