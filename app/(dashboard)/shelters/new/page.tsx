import { CreateShelterForm } from "@/components/shelters/create-shelter-form"
import { requireRole } from "@/lib/auth/require-role"

export default async function NewShelterPage() {
  await requireRole(["ADMIN"])

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl tracking-tighter">Create Shelter</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a shelter profile that can later be connected to staff and pets.
        </p>
      </div>
      <CreateShelterForm />
    </div>
  )
}
