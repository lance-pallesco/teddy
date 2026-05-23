import { z } from "zod"

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    email: z.string().trim().email("Enter a valid email address"),
    phone: z
      .string()
      .trim()
      .regex(/^\d{10,15}$/, "Phone must be 10 to 15 digits"),
    gender: z.string().trim().min(1, "Gender is required"),
    address: z.string().trim().min(1, "Address is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must include an uppercase letter")
      .regex(/\d/, "Password must include a number"),
    confirmPassword: z.string().min(1, "Confirm your password"),
    role: z.enum(["ADOPTER", "RESCUER"]).default("ADOPTER"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type RegisterInput = z.output<typeof registerSchema>
export type RegisterFormInput = z.input<typeof registerSchema>
