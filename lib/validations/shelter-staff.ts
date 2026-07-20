import { z } from "zod"

export const createShelterStaffSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .regex(/^\d{10,15}$/, "Phone must be 10 to 15 digits"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"], {
    message: "Gender is required",
  }),
  address: z.string().trim().min(1, "Address is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must include an uppercase letter")
    .regex(/\d/, "Password must include a number"),
  shelterId: z.uuid("Invalid shelter id"),
  avatar: z.string().trim().nullable().optional(),
})

export type CreateShelterStaffInput = z.output<typeof createShelterStaffSchema>
export type CreateShelterStaffFormInput = z.input<typeof createShelterStaffSchema>

