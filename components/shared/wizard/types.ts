import type { ZodSchema } from "zod"

export interface WizardStep {
  id: number
  title: string
  description: string
  component: any
  schema: ZodSchema
}

export interface WizardConfig {
  steps: WizardStep[]
}
