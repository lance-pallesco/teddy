import { requireRole } from "@/lib/auth/require-role"
import { prisma } from "@/lib/prisma"
import { UsersClient } from "@/components/users/users-client"

export default async function UsersPage() {
  // 1. Enforce ADMIN role access
  await requireRole(["ADMIN"])

  // 2. Fetch all users from db (excluding admins)
  const users = await prisma.user.findMany({
    where: {
      role: {
        not: "ADMIN",
      },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      address: true,
      avatar: true,
      role: true,
      isActive: true,
      createdAt: true,
      shelter: {
        select: {
          name: true,
        },
      },
    },
  })

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:px-16 md:py-6 w-full max-w-full min-w-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#3D3C3A]">Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage users, view contact details, verify shelter staff roles, and activate or deactivate accounts.
          </p>
        </div>
      </div>

      <UsersClient initialUsers={users} />
    </div>
  )
}
