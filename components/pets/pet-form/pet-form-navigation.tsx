"use client"

import { CheckIcon } from "lucide-react"

import { usePetFormContext } from "@/components/pets/pet-form/pet-form-provider"
import { cn } from "@/lib/utils"
import { PET_FORM_STEPS } from "@/lib/constants/pet"

type PetFormNavigationProps = {
  disabled?: boolean
}

export function PetFormNavigation({ disabled }: PetFormNavigationProps) {
  const { currentStepIndex, goToStep } = usePetFormContext()

  return (
    <nav aria-label="Pet form progress" className="w-full">
      <ol className="grid gap-3 md:grid-cols-3">
        {PET_FORM_STEPS.map((step, index) => {
          const isComplete = index < currentStepIndex
          const isCurrent = index === currentStepIndex

          return (
            <li key={step.id}>
              <button
                type="button"
                disabled={disabled || index > currentStepIndex}
                onClick={() => goToStep(index)}
                className={cn(
                  "flex w-full flex-col gap-1.5 rounded-lg border p-4 text-left transition-colors",
                  isCurrent && "border-primary bg-primary/5",
                  isComplete && "border-primary/40 bg-muted/40",
                  !isCurrent && !isComplete && "border-border bg-background",
                  index > currentStepIndex && "cursor-not-allowed opacity-50"
                )}
              >
                <span className="flex items-center gap-2 text-sm font-medium">
                  <span
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs",
                      (isCurrent || isComplete) &&
                        "border-primary bg-primary text-primary-foreground"
                    )}
                  >
                    {isComplete ? <CheckIcon className="size-4" /> : index + 1}
                  </span>
                  {step.title}
                </span>
                <span className="text-xs text-muted-foreground">{step.description}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
