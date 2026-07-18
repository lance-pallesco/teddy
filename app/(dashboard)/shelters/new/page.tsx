import { CreateShelterForm } from "@/components/shelters/create-shelter-form"
import { requireRole } from "@/lib/auth/require-role"

export default async function NewShelterPage() {
  await requireRole(["ADMIN"])

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#3D3C3A]">
            Create Shelter
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add a shelter profile that can later be connected to staff and pets.
          </p>
        </div>

        <CreateShelterForm />
      </div>
    </div>
  )
}
