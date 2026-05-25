import { z } from "zod"

const optionalText = (max: number, message: string) =>
  z
    .string()
    .trim()
    .max(max, message)
    .optional()
    .or(z.literal(""))

const logoSchema = z
  .string()
  .trim()
  .refine(
    (value) =>
      value === "" ||
      value.startsWith("/uploads/") ||
      /^https?:\/\//i.test(value),
    "Logo must be a valid uploaded image URL"
  )
  .optional()
  .or(z.literal(""))

export const shelterFieldsSchema = z.object({
  name: z.string().trim().min(2, "Shelter name must be at least 2 characters"),
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(1000, "Description must be 1000 characters or fewer"),
  address: z.string().trim().min(1, "Address is required"),
  barangay: optionalText(120, "Barangay must be 120 characters or fewer"),
  city: z.string().trim().min(1, "City is required"),
  province: z.string().trim().min(1, "Province is required"),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{4,10}$/, "Postal code must be 4 to 10 digits")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .trim()
    .regex(/^\d{10,15}$/, "Phone must be 10 to 15 digits"),
  email: z.string().trim().email("Enter a valid email address"),
  logo: logoSchema,
})

export const createShelterSchema = shelterFieldsSchema

export const updateShelterSchema = shelterFieldsSchema.extend({
  id: z.uuid("Invalid shelter id"),
})

export type ShelterFieldsInput = z.output<typeof shelterFieldsSchema>
export type CreateShelterInput = ShelterFieldsInput
export type CreateShelterFormInput = z.input<typeof createShelterSchema>
export type UpdateShelterInput = z.output<typeof updateShelterSchema>
export type UpdateShelterFormInput = z.input<typeof updateShelterSchema>
export type ShelterFormInput = CreateShelterFormInput
