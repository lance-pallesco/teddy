"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { createPetAction } from "@/app/(dashboard)/pets/actions/create-pet"
import { updatePetAction } from "@/app/(dashboard)/pets/actions/pet.actions"
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
  updatePetSchema,
  type PetFormInput,
} from "@/lib/validations/pet"

const STEP_COMPONENTS: Record<
  PetFormStepId,
  React.ComponentType<{ disabled?: boolean }>
> = {
  details: DetailsStep,
  care: CareStep,
  media: MediaStep,
}

type PetFormMode = "create" | "edit"

type PetFormProps =
  | { mode?: "create" }
  | {
      mode: "edit"
      petId: string
      defaultValues: PetFormInput
      cancelHref: string
    }

function PetFormSteps({ disabled }: { disabled?: boolean }) {
  const { currentStep } = usePetFormContext()
  const StepComponent = STEP_COMPONENTS[currentStep.id]

  return <StepComponent disabled={disabled} />
}

function PetFormFooter({
  mode,
  cancelHref,
  disabled,
  onSubmit,
}: {
  mode: PetFormMode
  cancelHref: string
  disabled?: boolean
  onSubmit: () => Promise<void>
}) {
  const { isFirstStep, isLastStep, goBack, goNext } = usePetFormContext()
  const isEdit = mode === "edit"

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-2">
        {!isFirstStep ? (
          <Button type="button" variant="outline" size="lg" disabled={disabled} onClick={goBack}>
            Back
          </Button>
        ) : (
          <Button type="button" variant="outline" size="lg" asChild disabled={disabled}>
            <Link href={cancelHref}>Cancel</Link>
          </Button>
        )}
      </div>

      {isLastStep ? (
        <Button type="button" size="lg" disabled={disabled} onClick={() => void onSubmit()}>
          {disabled
            ? isEdit
              ? "Saving..."
              : "Creating..."
            : isEdit
              ? "Save changes"
              : "Create pet"}
        </Button>
      ) : (
        <Button type="button" size="lg" disabled={disabled} onClick={() => void goNext()}>
          Continue
        </Button>
      )}
    </div>
  )
}

function PetFormContent(props: PetFormProps) {
  const isEdit = props.mode === "edit"
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const form = useForm<PetFormInput>({
    resolver: zodResolver(petFormSchema),
    defaultValues: isEdit ? props.defaultValues : emptyCreatePetFormValues,
    mode: "onBlur",
  })

  const cancelHref = isEdit ? props.cancelHref : "/pets"
  const successHref = isEdit ? `/pets/${props.petId}` : "/pets"

  async function handleSubmit() {
    const values = isEdit ? { ...form.getValues(), petId: props.petId } : form.getValues()
    const parsed = isEdit
      ? updatePetSchema.safeParse(values)
      : createPetSchema.safeParse(values)

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]
      toast.error(firstIssue?.message ?? "Please fix the highlighted fields before saving.")
      await form.trigger()
      return
    }

    startTransition(async () => {
      const response = isEdit
        ? await updatePetAction(values)
        : await createPetAction(form.getValues())

      if (!response.success) {
        toast.error(response.message)
        return
      }

      toast.success(response.message)
      router.push(successHref)
      router.refresh()
    })
  }

  return (
    <PetFormProvider form={form} mode={isEdit ? "edit" : "create"}>
      <div className="flex w-full flex-col gap-6">
        <PetFormNavigation disabled={isPending} />
        <PetFormSteps disabled={isPending} />
        <PetFormFooter
          mode={isEdit ? "edit" : "create"}
          cancelHref={cancelHref}
          disabled={isPending}
          onSubmit={handleSubmit}
        />
      </div>
    </PetFormProvider>
  )
}

export function PetForm(props: PetFormProps = { mode: "create" }) {
  return <PetFormContent {...props} />
}
