import { notFound, redirect } from "next/navigation"

import { PetForm } from "@/components/pets/pet-form/pet-form"
import { requireRole } from "@/lib/auth/require-role"
import { getPetForEdit } from "@/lib/services/pet.service"
import { mapPetToFormValues } from "@/lib/utils/pet-form"
import { canManagePet } from "@/lib/utils/pet-permissions"

type EditPetPageProps = {
  params: Promise<{ id: string }>
}

export default async function EditPetPage({ params }: EditPetPageProps) {
  const user = await requireRole(["ADMIN", "SHELTER_STAFF", "PET_OWNER"])
  const { id } = await params
  const pet = await getPetForEdit(id)

  if (!pet) {
    notFound()
  }

  if (
    !canManagePet(pet, {
      id: user.id,
      role: user.role,
      shelterId: user.shelterId,
    })
  ) {
    redirect("/unauthorized")
  }

  const defaultValues = mapPetToFormValues(pet)

  return (
    <div className="flex w-full flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Edit {pet.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Update listing details, photos, and compatibility information.
          </p>
        </div>
        <PetForm
          mode="edit"
          petId={pet.id}
          defaultValues={defaultValues}
          cancelHref={`/pets/${pet.id}`}
        />
      </div>
    </div>
  )
}
