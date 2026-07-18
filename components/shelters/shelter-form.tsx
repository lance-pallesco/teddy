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
        <Button type="button" className="bg-white text-black text-base font-light px-6 transition-transform duration-200 gap-2 shadow-sm" variant="outline" asChild disabled={isPending}>
          <Link href="/shelters">Cancel</Link>
        </Button>
        <Button type="submit" disabled={isPending} className="cursor-pointer bg-[#AE8F65] text-white border-[#AE8F65] hover:bg-[#AE8F65] hover:text-white hover:border-[#9A7D58] text-base font-light px-6 transition-transform duration-200 gap-2 shadow-sm">
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
