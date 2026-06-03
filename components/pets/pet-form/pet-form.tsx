"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { createPetAction } from "@/app/(dashboard)/pets/actions/create-pet"
import { PetFormNavigation } from "@/components/pets/pet-form/pet-form-navigation"
import {
  PetFormProvider,
  usePetFormContext,
} from "@/components/pets/pet-form/pet-form-provider"
import { CareStep } from "@/components/pets/pet-form/steps/care-step"
import { DetailsStep } from "@/components/pets/pet-form/steps/details-step"
import { MediaStep } from "@/components/pets/pet-form/steps/media-step"
import { Button } from "@/components/ui/button"
import type { PetFormStepId } from "@/lib/constants/pet"
import {
  createPetSchema,
  emptyCreatePetFormValues,
  petFormSchema,
  type CreatePetFormInput,
} from "@/lib/validations/pet"

const STEP_COMPONENTS: Record<
  PetFormStepId,
  React.ComponentType<{ disabled?: boolean }>
> = {
  details: DetailsStep,
  care: CareStep,
  media: MediaStep,
}

function PetFormSteps({ disabled }: { disabled?: boolean }) {
  const { currentStep } = usePetFormContext()
  const StepComponent = STEP_COMPONENTS[currentStep.id]

  return <StepComponent disabled={disabled} />
}

function PetFormFooter({
  disabled,
  onSubmit,
}: {
  disabled?: boolean
  onSubmit: () => Promise<void>
}) {
  const { isFirstStep, isLastStep, goBack, goNext } = usePetFormContext()

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-2">
        {!isFirstStep ? (
          <Button type="button" variant="outline" size="lg" disabled={disabled} onClick={goBack}>
            Back
          </Button>
        ) : (
          <Button type="button" variant="outline" size="lg" asChild disabled={disabled}>
            <Link href="/pets">Cancel</Link>
          </Button>
        )}
      </div>

      {isLastStep ? (
        <Button type="button" size="lg" disabled={disabled} onClick={() => void onSubmit()}>
          {disabled ? "Creating..." : "Create pet"}
        </Button>
      ) : (
        <Button type="button" size="lg" disabled={disabled} onClick={() => void goNext()}>
          Continue
        </Button>
      )}
    </div>
  )
}

function PetFormContent() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const form = useForm<CreatePetFormInput>({
    resolver: zodResolver(petFormSchema),
    defaultValues: emptyCreatePetFormValues,
    mode: "onBlur",
  })

  async function handleSubmit() {
    const parsed = createPetSchema.safeParse(form.getValues())

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]
      toast.error(firstIssue?.message ?? "Please fix the highlighted fields before saving.")
      await form.trigger()
      return
    }

    startTransition(async () => {
      const response = await createPetAction(form.getValues())

      if (!response.success) {
        toast.error(response.message)
        return
      }

      toast.success(response.message)
      router.push("/pets")
      router.refresh()
    })
  }

  return (
    <PetFormProvider form={form}>
      <div className="flex w-full flex-col gap-6">
        <PetFormNavigation disabled={isPending} />
        <PetFormSteps disabled={isPending} />
        <PetFormFooter disabled={isPending} onSubmit={handleSubmit} />
      </div>
    </PetFormProvider>
  )
}

export function PetForm() {
  return <PetFormContent />
}
