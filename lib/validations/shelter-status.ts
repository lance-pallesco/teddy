import { z } from "zod"

export const toggleShelterStatusSchema = z.object({
  shelterId: z.uuid("Invalid shelter id"),
})

export type ToggleShelterStatusInput = z.output<typeof toggleShelterStatusSchema>
