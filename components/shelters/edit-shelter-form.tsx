import { ShelterForm } from "@/components/shelters/shelter-form"
import type { ShelterFormRecord } from "@/lib/services/shelter.service"

type EditShelterFormProps = {
  shelter: ShelterFormRecord
}

export function EditShelterForm({ shelter }: EditShelterFormProps) {
  return <ShelterForm mode="edit" initialData={shelter} />
}
