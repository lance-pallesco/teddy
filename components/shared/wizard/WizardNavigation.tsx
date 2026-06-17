"use client"

import { Button } from "@/components/ui/button"
import { Loader2Icon } from "lucide-react"

interface WizardNavigationProps {
  currentStep: number
  totalSteps: number
  isSubmitting: boolean
  isSavingDraft?: boolean
  onBack: () => void
  onNext: () => void
  onSaveDraft?: () => void
  disableNext?: boolean
}

export function WizardNavigation({
  currentStep,
  totalSteps,
  isSubmitting,
  isSavingDraft = false,
  onBack,
  onNext,
  onSaveDraft,
  disableNext = false,
}: WizardNavigationProps) {
  const isFirstStep = currentStep === 1
  const isLastStep = currentStep === totalSteps
  const showSaveDraft = currentStep >= 2 && currentStep <= 6

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-row items-center justify-between gap-4 pt-4 border-t">
        {/* Back Button */}
        <div>
          {!isFirstStep && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={isSubmitting || isSavingDraft}
              onClick={onBack}
            >
              Back
            </Button>
          )}
        </div>

        {/* Next / Submit Button */}
        <div>
          {isLastStep ? (
            <Button
              type="button"
              size="lg"
              disabled={isSubmitting || isSavingDraft || disableNext}
              onClick={onNext}
              className="min-w-32"
            >
              {isSubmitting ? (
                <>
                  <Loader2Icon className="size-4 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          ) : (
            <Button
              type="button"
              size="lg"
              disabled={isSubmitting || isSavingDraft || disableNext}
              onClick={onNext}
              className="min-w-28"
            >
              {isSubmitting ? (
                <>
                  <Loader2Icon className="size-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Save as Draft Link */}
      {showSaveDraft && onSaveDraft && (
        <div className="text-center">
          <button
            type="button"
            disabled={isSubmitting || isSavingDraft}
            onClick={onSaveDraft}
            className="text-sm font-medium text-primary hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer"
          >
            {isSavingDraft ? "Saving progress..." : "Save as Draft"}
          </button>
        </div>
      )}
    </div>
  )
}
