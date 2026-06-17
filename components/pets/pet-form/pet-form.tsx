"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { createPetAction } from "@/app/(dashboard)/pets/actions/create-pet"
import { updatePetAction } from "@/app/(dashboard)/pets/actions/pet.actions"
import { PetFormProvider } from "@/components/pets/pet-form/pet-form-provider"
import { DetailsStep } from "@/components/pets/pet-form/steps/details-step"
import { CareStep } from "@/components/pets/pet-form/steps/care-step"
import { MediaStep } from "@/components/pets/pet-form/steps/media-step"
import { WizardShell } from "@/components/shared/wizard/WizardShell"
import type { WizardStep } from "@/components/shared/wizard/types"
import {
  createPetSchema,
  emptyCreatePetFormValues,
  petFormSchema,
  updatePetSchema,
  type PetFormInput,
  petDetailsStepSchema,
  petCareStepSchema,
  petMediaStepSchema,
} from "@/lib/validations/pet"

const PET_WIZARD_STEPS: WizardStep[] = [
  {
    id: 1,
    title: "Pet details",
    description: "Name, species, size, and appearance",
    component: DetailsStep,
    schema: petDetailsStepSchema,
  },
  {
    id: 2,
    title: "Behavior & care",
    description: "Temperament, compatibility, and special needs",
    component: CareStep,
    schema: petCareStepSchema,
  },
  {
    id: 3,
    title: "Photos & listing",
    description: "Images and public description",
    component: MediaStep,
    schema: petMediaStepSchema,
  },
]

const PET_STEP_FIELD_NAMES: Record<number, (keyof PetFormInput)[]> = {
  1: [
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
  2: [
    "tags",
    "goodWithKids",
    "goodWithDogs",
    "goodWithCats",
    "isHouseTrained",
    "specialNeeds",
    "specialNeedsNote",
  ],
  3: ["photos", "description"],
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

function PetFormContent(props: PetFormProps) {
  const isEdit = props.mode === "edit"
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [currentStep, setCurrentStep] = useState(1)

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

  const handleNext = async () => {
    // Validate fields for current step
    const fields = PET_STEP_FIELD_NAMES[currentStep]
    if (fields) {
      const isValid = await form.trigger(fields, { shouldFocus: true })
      if (!isValid) {
        toast.error("Please complete all required fields on this step.")
        return
      }
    }

    if (currentStep === 3) {
      await handleSubmit()
    } else {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const ActiveStepComponent = PET_WIZARD_STEPS[currentStep - 1]?.component ?? DetailsStep

  return (
    <PetFormProvider form={form} mode={isEdit ? "edit" : "create"}>
      <WizardShell
        steps={PET_WIZARD_STEPS}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        onNext={handleNext}
      >
        <ActiveStepComponent disabled={isPending} />
      </WizardShell>
    </PetFormProvider>
  )
}

export function PetForm(props: PetFormProps = { mode: "create" }) {
  return <PetFormContent {...props} />
}
