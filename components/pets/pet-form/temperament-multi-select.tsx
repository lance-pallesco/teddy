"use client"

import { useState } from "react"
import { ChevronsUpDownIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  PET_TEMPERAMENT_VALUES,
  type PetTemperament,
} from "@/lib/constants/pet"
import { cn } from "@/lib/utils"

type TemperamentMultiSelectProps = {
  value: PetTemperament[]
  onChange: (value: PetTemperament[]) => void
  disabled?: boolean
  error?: { message?: string }
}

export function TemperamentMultiSelect({
  value,
  onChange,
  disabled,
  error,
}: TemperamentMultiSelectProps) {
  const [open, setOpen] = useState(false)

  function toggle(temperament: PetTemperament) {
    onChange(
      value.includes(temperament)
        ? value.filter((item) => item !== temperament)
        : [...value, temperament]
    )
  }

  const triggerLabel =
    value.length === 0
      ? "Select temperament traits"
      : `${value.length} trait${value.length === 1 ? "" : "s"} selected`

  return (
    <Field className="md:col-span-2">
      <FieldLabel>Temperament</FieldLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            aria-invalid={!!error}
            className={cn(
              "justify-between font-normal",
              !value.length && "text-muted-foreground"
            )}
          >
            <span className="truncate">{triggerLabel}</span>
            <ChevronsUpDownIcon className="size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2" align="start">
          <ul className="max-h-64 space-y-1 overflow-y-auto">
            {PET_TEMPERAMENT_VALUES.map((temperament) => {
              const checked = value.includes(temperament)

              return (
                <li key={temperament}>
                  <label
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-md px-2 py-2.5 text-sm hover:bg-muted",
                      disabled && "pointer-events-none opacity-50"
                    )}
                  >
                    <Checkbox
                      checked={checked}
                      disabled={disabled}
                      onCheckedChange={() => toggle(temperament)}
                    />
                    <span>{temperament}</span>
                  </label>
                </li>
              )
            })}
          </ul>
        </PopoverContent>
      </Popover>
      {value.length > 0 ? (
        <div className="flex flex-wrap gap-2 pt-1">
          {value.map((temperament) => (
            <Badge key={temperament} variant="secondary">
              {temperament}
            </Badge>
          ))}
        </div>
      ) : null}
      <FieldDescription>Select all traits that describe this pet.</FieldDescription>
      <FieldError errors={[error]} />
    </Field>
  )
}
