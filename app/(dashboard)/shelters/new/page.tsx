import { CreateShelterForm } from "@/components/shelters/create-shelter-form"

export default function NewShelterPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Create Shelter</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a shelter profile that can later be connected to staff and pets.
        </p>
      </div>
      <CreateShelterForm />
    </div>
  )
}
