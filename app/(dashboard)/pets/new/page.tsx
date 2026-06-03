import { CreatePetForm } from "@/components/pets/create-pet-form"
import { requireRole } from "@/lib/auth/require-role"

export default async function AddPetPage() {
  await requireRole(["SHELTER_STAFF", "PET_OWNER"])

  return (
    <div className="flex w-full flex-1 flex-col gap-6 p-4 md:p-6">
        <h1 className="text-2xl font-semibold tracking-tight">Add New Pet</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a pet listing in three short steps.
        </p>
      <CreatePetForm />
    </div>
  )
}
