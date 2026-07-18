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
import { ShelterSummaryCard } from "@/components/shelters/shelter-summary-card"
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
    watch,
    formState: { errors },
  } = form

  const watchedValues = watch()

  // Construct dynamic shelter object for real-time preview card
  const watchedShelter: Partial<ShelterFormRecord> = {
    id: isEdit ? props.initialData.id : "",
    name: watchedValues.name || "",
    description: watchedValues.description || "",
    logo: watchedValues.logo || null,
    address: watchedValues.address || "",
    barangay: watchedValues.barangay || null,
    city: watchedValues.city || "",
    province: watchedValues.province || "",
    postalCode: watchedValues.postalCode || null,
    phone: watchedValues.phone || "",
    email: watchedValues.email || "",
    isActive: isEdit ? props.initialData.isActive : true,
  }

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
      router.push(isEdit ? `/shelters/${props.initialData.id}` : "/shelters")
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Interactive Summary Card with Drag-and-Drop Uploader */}
        <div className="lg:col-span-1">
          <ShelterSummaryCard
            variant={isEdit ? "preview" : "new"}
            shelter={watchedShelter}
            logoValue={watchedValues.logo ?? null}
            logoError={errors.logo?.message}
            disabled={isPending}
            onLogoChange={(url) =>
              setValue("logo", url, { shouldDirty: true, shouldValidate: true })
            }
          />
        </div>

        {/* Right Column: Form Fields and Submit actions */}
        <div className="lg:col-span-2 space-y-6">
          <ShelterFormFields
            register={register}
            control={control}
            errors={errors}
            setValue={setValue}
            disabled={isPending}
          />

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end border-t pt-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="rounded-lg cursor-pointer transition-colors duration-200 hover:bg-neutral-50 hover:text-neutral-900 font-medium shadow-none text-sm h-10 px-4 py-2"
              asChild
              disabled={isPending}
            >
              <Link href={isEdit ? `/shelters/${props.initialData.id}` : "/shelters"}>
                Cancel
              </Link>
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={isPending}
              className="min-w-32 bg-[#AE8F65] text-white border-transparent hover:bg-[#9A7D58] hover:text-white cursor-pointer rounded-lg transition-colors duration-200 font-medium shadow-none text-sm h-10 px-4 py-2"
            >
              {isPending
                ? isEdit
                  ? "Saving changes..."
                  : "Creating shelter..."
                : isEdit
                  ? "Save Changes"
                  : "Create Shelter"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
