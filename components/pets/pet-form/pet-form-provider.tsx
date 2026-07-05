"use client"

import { createContext, useContext, type ReactNode } from "react"
import { FormProvider, type UseFormReturn } from "react-hook-form"

import type { PetFormInput } from "@/lib/validations/pet"

type PetFormMode = "create" | "edit"

type PetFormContextValue = {
  mode: PetFormMode
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
  return (
    <PetFormContext.Provider value={{ mode }}>
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
