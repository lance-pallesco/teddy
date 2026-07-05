"use client"

import { useFormContext, useWatch } from "react-hook-form"
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  HousingType,
  OwnershipStatus,
  LandlordAllowsPets,
  PropertySize,
  HOUSING_TYPE_LABELS,
  OWNERSHIP_STATUS_LABELS,
  LANDLORD_ALLOWS_PETS_LABELS,
  PROPERTY_SIZE_LABELS,
} from "@/lib/constants/application.constants"

interface Step2LivingEnvironmentProps {
  disabled?: boolean
}

export function Step2LivingEnvironment({ disabled }: Step2LivingEnvironmentProps) {
  const {
    setValue,
    control,
    formState,
  } = useFormContext()
  const errors = formState.errors as any

  const housingType = useWatch({ control, name: "livingEnvironment.housingType" })
  const ownershipStatus = useWatch({ control, name: "livingEnvironment.ownershipStatus" })
  const landlordAllowsPets = useWatch({ control, name: "livingEnvironment.landlordAllowsPets" })
  const propertySize = useWatch({ control, name: "livingEnvironment.propertySize" })
  const isPetFriendly = useWatch({ control, name: "livingEnvironment.isPetFriendly" })

  const isRenting = ownershipStatus === "RENT"

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Living Environment</h3>
        <p className="text-sm text-muted-foreground">
          Tell us about the home where the pet will live.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Housing Type */}
        <Field>
          <FieldLabel htmlFor="housing-type">Housing Type</FieldLabel>
          <Select
            value={housingType}
            onValueChange={(val) =>
              setValue("livingEnvironment.housingType", val, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            disabled={disabled}
          >
            <SelectTrigger id="housing-type" aria-invalid={!!errors.livingEnvironment?.housingType}>
              <SelectValue placeholder="Select housing type" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(HousingType).map((type) => (
                <SelectItem key={type} value={type}>
                  {HOUSING_TYPE_LABELS[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={[errors.livingEnvironment?.housingType]} />
        </Field>

        {/* Ownership Status */}
        <Field>
          <FieldLabel htmlFor="ownership-status">Ownership Status</FieldLabel>
          <Select
            value={ownershipStatus}
            onValueChange={(val) => {
              setValue("livingEnvironment.ownershipStatus", val, {
                shouldDirty: true,
                shouldValidate: true,
              })
              if (val !== "RENT") {
                setValue("livingEnvironment.landlordAllowsPets", undefined)
              }
            }}
            disabled={disabled}
          >
            <SelectTrigger id="ownership-status" aria-invalid={!!errors.livingEnvironment?.ownershipStatus}>
              <SelectValue placeholder="Select ownership status" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(OwnershipStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  {OWNERSHIP_STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={[errors.livingEnvironment?.ownershipStatus]} />
        </Field>

        {/* Landlord Allows Pets - Conditional */}
        {isRenting && (
          <Field className="animate-in fade-in slide-in-from-top-1 duration-200">
            <FieldLabel htmlFor="landlord-allows-pets">Landlord Allows Pets?</FieldLabel>
            <Select
              value={landlordAllowsPets}
              onValueChange={(val) =>
                setValue("livingEnvironment.landlordAllowsPets", val, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              disabled={disabled}
            >
              <SelectTrigger id="landlord-allows-pets" aria-invalid={!!errors.livingEnvironment?.landlordAllowsPets}>
                <SelectValue placeholder="Select landlord approval" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(LandlordAllowsPets).map((option) => (
                  <SelectItem key={option} value={option}>
                    {LANDLORD_ALLOWS_PETS_LABELS[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={[errors.livingEnvironment?.landlordAllowsPets]} />
          </Field>
        )}

        {/* Property Size */}
        <Field>
          <FieldLabel htmlFor="property-size">Property Size</FieldLabel>
          <Select
            value={propertySize}
            onValueChange={(val) =>
              setValue("livingEnvironment.propertySize", val, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            disabled={disabled}
          >
            <SelectTrigger id="property-size" aria-invalid={!!errors.livingEnvironment?.propertySize}>
              <SelectValue placeholder="Select property size" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(PropertySize).map((size) => (
                <SelectItem key={size} value={size}>
                  {PROPERTY_SIZE_LABELS[size]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={[errors.livingEnvironment?.propertySize]} />
        </Field>

        {/* Is Property Pet Friendly */}
        <Field>
          <FieldLabel htmlFor="is-pet-friendly">Is the property pet-friendly?</FieldLabel>
          <Select
            value={isPetFriendly}
            onValueChange={(val) =>
              setValue("livingEnvironment.isPetFriendly", val, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            disabled={disabled}
          >
            <SelectTrigger id="is-pet-friendly" aria-invalid={!!errors.livingEnvironment?.isPetFriendly}>
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="YES">Yes</SelectItem>
              <SelectItem value="NO">No</SelectItem>
              <SelectItem value="NOT_SURE">Not Sure</SelectItem>
            </SelectContent>
          </Select>
          <FieldError errors={[errors.livingEnvironment?.isPetFriendly]} />
        </Field>
      </div>
    </div>
  )
}
