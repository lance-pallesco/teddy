"use client"

import { createContext, useContext, useMemo, useState, type ReactNode } from "react"
import {
  FormProvider,
  type FieldPath,
  type UseFormReturn,
} from "react-hook-form"

import { PET_FORM_STEPS, type PetFormStepId } from "@/lib/constants/pet"
import type { PetFormInput } from "@/lib/validations/pet"

const STEP_FIELD_NAMES: Record<PetFormStepId, FieldPath<PetFormInput>[]> = {
  details: [
    "name",
    "species",
    "breed",
    "age",
    "ageUnit",
    "gender",
    "size",
    "color",
    "weightKg",
  ],
  care: [
    "tags",
    "goodWithKids",
    "goodWithDogs",
    "goodWithCats",
    "isHouseTrained",
    "specialNeeds",
    "specialNeedsNote",
  ],
  media: ["photos", "description"],
}

type PetFormMode = "create" | "edit"

type PetFormContextValue = {
  mode: PetFormMode
  currentStepIndex: number
  currentStep: (typeof PET_FORM_STEPS)[number]
  totalSteps: number
  isFirstStep: boolean
  isLastStep: boolean
  goNext: () => Promise<boolean>
  goBack: () => void
  goToStep: (index: number) => void
}

const PetFormContext = createContext<PetFormContextValue | null>(null)

type PetFormProviderProps = {
  form: UseFormReturn<PetFormInput>
  mode?: PetFormMode
  children: ReactNode
}

export function PetFormProvider({
  form,
  mode = "create",
  children,
}: PetFormProviderProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const currentStep = PET_FORM_STEPS[currentStepIndex]
  const totalSteps = PET_FORM_STEPS.length

  const value = useMemo<PetFormContextValue>(
    () => ({
      mode,
      currentStepIndex,
      currentStep,
      totalSteps,
      isFirstStep: currentStepIndex === 0,
      isLastStep: currentStepIndex === totalSteps - 1,
      goBack: () => {
        setCurrentStepIndex((index) => Math.max(0, index - 1))
      },
      goToStep: (index: number) => {
        if (index >= 0 && index < totalSteps) {
          setCurrentStepIndex(index)
        }
      },
      goNext: async () => {
        const fields = STEP_FIELD_NAMES[currentStep.id]
        const isValid = await form.trigger(fields, { shouldFocus: true })

        if (!isValid) {
          return false
        }

        setCurrentStepIndex((index) => Math.min(totalSteps - 1, index + 1))
        return true
      },
    }),
    [currentStep, currentStepIndex, form, mode, totalSteps]
  )

  return (
    <PetFormContext.Provider value={value}>
      <FormProvider {...form}>{children}</FormProvider>
    </PetFormContext.Provider>
  )
}

export function usePetFormContext() {
  const context = useContext(PetFormContext)

  if (!context) {
    throw new Error("usePetFormContext must be used within PetFormProvider")
  }

  return context
}
