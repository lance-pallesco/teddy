"use client"

import { WizardProgress } from "./WizardProgress"
import { WizardNavigation } from "./WizardNavigation"
import { WizardStepWrapper } from "./WizardStepWrapper"
import type { WizardStep } from "./types"

interface WizardShellProps {
  steps: WizardStep[]
  currentStep: number
  onStepChange: (step: number) => void
  onSubmit: () => void
  isSubmitting: boolean
  isSavingDraft?: boolean
  onSaveDraft?: () => void
  onNext?: () => void
  disableNext?: boolean
  children: React.ReactNode
}

export function WizardShell({
  steps,
  currentStep,
  onStepChange,
  onSubmit,
  isSubmitting,
  isSavingDraft = false,
  onSaveDraft,
  onNext,
  disableNext = false,
  children,
}: WizardShellProps) {
  const handleNext = () => {
    if (onNext) {
      onNext()
    } else if (currentStep === steps.length) {
      onSubmit()
    } else {
      onStepChange(currentStep + 1)
    }
  }

  const handleBack = () => {
    onStepChange(Math.max(1, currentStep - 1))
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Progress Indicator */}
      <WizardProgress steps={steps} currentStep={currentStep} />

      {/* Current Step Content */}
      <WizardStepWrapper key={currentStep}>
        <div className="bg-card border rounded-xl p-5 md:p-6 shadow-xs">
          {children}
        </div>
      </WizardStepWrapper>

      {/* Navigation Buttons & Links */}
      <WizardNavigation
        currentStep={currentStep}
        totalSteps={steps.length}
        isSubmitting={isSubmitting}
        isSavingDraft={isSavingDraft}
        onBack={handleBack}
        onNext={handleNext}
        onSaveDraft={onSaveDraft}
        disableNext={disableNext}
      />
    </div>
  )
}
