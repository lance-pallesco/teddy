"use client"

import type {
  Control,
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form"
import { useWatch } from "react-hook-form"

import { ShelterLogoUpload } from "@/components/shelters/shelter-logo-upload"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type {
  CreateShelterFormInput,
  UpdateShelterFormInput,
} from "@/lib/validations/shelter"

type ShelterFormFieldsProps = {
  register: UseFormRegister<CreateShelterFormInput | UpdateShelterFormInput>
  control: Control<CreateShelterFormInput | UpdateShelterFormInput>
  errors: FieldErrors<CreateShelterFormInput | UpdateShelterFormInput>
  setValue: UseFormSetValue<CreateShelterFormInput | UpdateShelterFormInput>
  disabled?: boolean
}

export function ShelterFormFields({
  register,
  control,
  errors,
  setValue,
  disabled,
}: ShelterFormFieldsProps) {
  const logo = useWatch({ control, name: "logo" })

  return (
    <>
      <section className="rounded-lg border p-5 bg-white">
        <div className="mb-5">
          <h2 className="text-base font-medium">Shelter Details</h2>
          <p className="text-sm text-muted-foreground">
            Basic information shown to administrators and future adopters.
          </p>
        </div>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="name">Shelter Name</FieldLabel>
            <Input id="name" aria-invalid={!!errors.name} {...register("name")} />
            <FieldError errors={[errors.name]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <textarea
              id="description"
              rows={5}
              disabled={disabled}
              aria-invalid={!!errors.description}
              className="min-h-28 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20"
              {...register("description")}
            />
            <FieldError errors={[errors.description]} />
          </Field>
        </FieldGroup>
      </section>

      <section className="rounded-lg border p-5 bg-white">
        <div className="mb-5">
          <h2 className="text-base font-medium">Location</h2>
          <p className="text-sm text-muted-foreground">
            Address data used for shelter filtering and regional reporting.
          </p>
        </div>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="address">Address</FieldLabel>
            <Input
              id="address"
              disabled={disabled}
              aria-invalid={!!errors.address}
              {...register("address")}
            />
            <FieldError errors={[errors.address]} />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="barangay">Barangay</FieldLabel>
              <Input
                id="barangay"
                disabled={disabled}
                aria-invalid={!!errors.barangay}
                {...register("barangay")}
              />
              <FieldError errors={[errors.barangay]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="city">City</FieldLabel>
              <Input
                id="city"
                disabled={disabled}
                aria-invalid={!!errors.city}
                {...register("city")}
              />
              <FieldError errors={[errors.city]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="province">Province</FieldLabel>
              <Input
                id="province"
                disabled={disabled}
                aria-invalid={!!errors.province}
                {...register("province")}
              />
              <FieldError errors={[errors.province]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="postalCode">Postal Code</FieldLabel>
              <Input
                id="postalCode"
                inputMode="numeric"
                disabled={disabled}
                aria-invalid={!!errors.postalCode}
                {...register("postalCode")}
              />
              <FieldError errors={[errors.postalCode]} />
            </Field>
          </div>
        </FieldGroup>
      </section>

      <section className="rounded-lg border p-5 bg-white">
        <div className="mb-5">
          <h2 className="text-base font-medium">Contact & Logo</h2>
          <p className="text-sm text-muted-foreground">
            Contact channels and the optional shelter logo.
          </p>
        </div>
        <FieldGroup>
          <div className="grid gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="phone">Phone</FieldLabel>
              <Input
                id="phone"
                inputMode="numeric"
                disabled={disabled}
                aria-invalid={!!errors.phone}
                {...register("phone")}
              />
              <FieldError errors={[errors.phone]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                disabled={disabled}
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              <FieldError errors={[errors.email]} />
            </Field>
          </div>
          <Field>
            <FieldLabel>Logo</FieldLabel>
            <ShelterLogoUpload
              value={logo}
              disabled={disabled}
              onChange={(url) =>
                setValue("logo", url, { shouldDirty: true, shouldValidate: true })
              }
            />
            <FieldError errors={[errors.logo]} />
          </Field>
        </FieldGroup>
      </section>
    </>
  )
}
