"use client"

import { CheckIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { WizardStep } from "./types"

interface WizardProgressProps {
  steps: WizardStep[]
  currentStep: number // 1-indexed
}

export function WizardProgress({ steps, currentStep }: WizardProgressProps) {
  const totalSteps = steps.length
  // Compute percentage (Step 1 is 0% or close to it, Step 7 is 100%)
  const percentage = Math.round(((currentStep - 1) / (totalSteps - 1)) * 100)
  const currentStepObj = steps.find((s) => s.id === currentStep)

  return (
    <div className="w-full space-y-6">
      {/* Title & Percent text */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Step {currentStep} of {totalSteps}
          </h2>
          {currentStepObj && (
            <p className="text-sm text-muted-foreground">
              {currentStepObj.title} &mdash; {currentStepObj.description}
            </p>
          )}
        </div>
        <span className="text-sm font-medium text-primary mt-1 sm:mt-0">
          {percentage}% Complete
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Step Circles Row */}
      <nav aria-label="Application progress">
        <ol className="flex items-center justify-between w-full gap-2 overflow-x-auto pb-2 scrollbar-none">
          {steps.map((step, idx) => {
            const stepNum = step.id
            const isCompleted = stepNum < currentStep
            const isCurrent = stepNum === currentStep
            const isFuture = stepNum > currentStep

            return (
              <li
                key={step.id}
                className={cn(
                  "flex items-center gap-2",
                  idx !== totalSteps - 1 && "flex-1"
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-all duration-200",
                      isCompleted && "border-primary bg-primary text-primary-foreground",
                      isCurrent && "border-primary bg-primary/10 text-primary ring-2 ring-primary/20",
                      isFuture && "border-border bg-background text-muted-foreground"
                    )}
                  >
                    {isCompleted ? <CheckIcon className="size-4" /> : stepNum}
                  </span>
                  <span
                    className={cn(
                      "hidden lg:inline text-xs font-medium whitespace-nowrap",
                      isCurrent && "text-foreground font-semibold",
                      isCompleted && "text-muted-foreground",
                      isFuture && "text-muted-foreground/60"
                    )}
                  >
                    {step.title}
                  </span>
                </div>
                {idx !== totalSteps - 1 && (
                  <div
                    className={cn(
                      "hidden sm:block h-px flex-1 mx-2 min-w-4",
                      isCompleted ? "bg-primary/50" : "bg-border"
                    )}
                  />
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </div>
  )
}
