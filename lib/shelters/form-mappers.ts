import type { ShelterFormRecord } from "@/lib/services/shelter.service"
import type { UpdateShelterFormInput } from "@/lib/validations/shelter"

export function shelterToFormValues(
  shelter: ShelterFormRecord
): UpdateShelterFormInput {
  return {
    id: shelter.id,
    name: shelter.name,
    description: shelter.description,
    logo: shelter.logo ?? "",
    address: shelter.address,
    barangay: shelter.barangay ?? "",
    city: shelter.city,
    province: shelter.province,
    postalCode: shelter.postalCode ?? "",
    phone: shelter.phone,
    email: shelter.email,
  }
}
