"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { createShelterAction } from "@/app/(dashboard)/shelters/actions/create-shelter"
import { updateShelterAction } from "@/app/(dashboard)/shelters/actions/update-shelter"
import { ShelterFormFields } from "@/components/shelters/shelter-form-fields"
import { Button } from "@/components/ui/button"
import type { ShelterFormRecord } from "@/lib/services/shelter.service"
import { shelterToFormValues } from "@/lib/shelters/form-mappers"
import {
  createShelterSchema,
  emptyShelterFormValues,
  updateShelterSchema,
  type CreateShelterFormInput,
  type UpdateShelterFormInput,
} from "@/lib/validations/shelter"

type ShelterFormProps =
  | { mode: "create" }
  | { mode: "edit"; initialData: ShelterFormRecord }

export function ShelterForm(props: ShelterFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const isEdit = props.mode === "edit"

  const form = useForm<CreateShelterFormInput | UpdateShelterFormInput>({
    resolver: zodResolver(isEdit ? updateShelterSchema : createShelterSchema),
    defaultValues: isEdit
      ? shelterToFormValues(props.initialData)
      : emptyShelterFormValues,
  })

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = form

  function onSubmit(values: CreateShelterFormInput | UpdateShelterFormInput) {
    startTransition(async () => {
      const response = isEdit
        ? await updateShelterAction(values)
        : await createShelterAction(values)

      if (!response.success) {
        toast.error(response.message)
        return
      }

      toast.success(response.message)
      router.push("/shelters")
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <ShelterFormFields
        register={register}
        control={control}
        errors={errors}
        setValue={setValue}
        disabled={isPending}
      />

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" asChild disabled={isPending}>
          <Link href="/shelters">Cancel</Link>
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? isEdit
              ? "Saving changes..."
              : "Creating shelter..."
            : isEdit
              ? "Save Changes"
              : "Create Shelter"}
        </Button>
      </div>
    </form>
  )
}
