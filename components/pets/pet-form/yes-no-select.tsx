"use client"

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
  PET_YES_NO_LABELS,
  PET_YES_NO_VALUES,
  type PetYesNoValue,
} from "@/lib/constants/pet"

type YesNoSelectProps = {
  id: string
  label: string
  value: PetYesNoValue | undefined
  onChange: (value: PetYesNoValue) => void
  disabled?: boolean
  error?: { message?: string }
}

export function YesNoSelect({
  id,
  label,
  value,
  onChange,
  disabled,
  error,
}: YesNoSelectProps) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Select
        value={value}
        onValueChange={(next) => onChange(next as PetYesNoValue)}
        disabled={disabled}
      >
        <SelectTrigger
          id={id}
          aria-invalid={!!error}
        >
          <SelectValue placeholder="Select yes or no" />
        </SelectTrigger>
        <SelectContent>
          {PET_YES_NO_VALUES.map((option) => (
            <SelectItem key={option} value={option}>
              {PET_YES_NO_LABELS[option]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldError errors={[error]} />
    </Field>
  )
}
