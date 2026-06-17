"use client"

import { useFormContext, useWatch } from "react-hook-form"
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface Step5AdoptionCommitmentProps {
  petName: string
  disabled?: boolean
}

export function Step5AdoptionCommitment({ petName, disabled }: Step5AdoptionCommitmentProps) {
  const {
    register,
    setValue,
    control,
    formState,
  } = useFormContext()
  const errors = formState.errors as any

  const whyThisPet = useWatch({ control, name: "adoptionCommitment.whyThisPet" }) ?? ""
  const typicalDayForPet = useWatch({ control, name: "adoptionCommitment.typicalDayForPet" })
  const financiallyPrepared = useWatch({ control, name: "adoptionCommitment.financiallyPrepared" })
  const timeCommitment = useWatch({ control, name: "adoptionCommitment.timeCommitment" })
  const commitToVetCare = useWatch({ control, name: "adoptionCommitment.commitToVetCare" })
  const additionalInfo = useWatch({ control, name: "adoptionCommitment.additionalInfo" })

  const whyThisPetLength = whyThisPet.length
  const isWhyThisPetValid = whyThisPetLength >= 50 && whyThisPetLength <= 2000

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Adoption Commitment</h3>
        <p className="text-sm text-muted-foreground">
          Help us understand your motivation and readiness to care for {petName}.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Why this pet */}
        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="why-this-pet">Why do you want to adopt {petName}?</FieldLabel>
            <span
              className={cn(
                "text-xs font-semibold tabular-nums",
                isWhyThisPetValid ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
              )}
            >
              {whyThisPetLength} / 2000
            </span>
          </div>
          <Textarea
            id="why-this-pet"
            placeholder={`Tell us specifically why you chose ${petName} and how they fit your life.`}
            rows={5}
            disabled={disabled}
            aria-invalid={!!errors.adoptionCommitment?.whyThisPet}
            {...register("adoptionCommitment.whyThisPet")}
          />
          <FieldError errors={[errors.adoptionCommitment?.whyThisPet]} />
        </Field>

        {/* Typical Day */}
        <Field>
          <FieldLabel htmlFor="typical-day">
            What does a typical day look like for this pet in your home?
          </FieldLabel>
          <Textarea
            id="typical-day"
            placeholder="Describe morning routine, feeding times, exercise, and evening — help us picture their life."
            rows={5}
            disabled={disabled}
            aria-invalid={!!errors.adoptionCommitment?.typicalDayForPet}
            {...register("adoptionCommitment.typicalDayForPet")}
          />
          <FieldError errors={[errors.adoptionCommitment?.typicalDayForPet]} />
        </Field>

        {/* Financially Prepared */}
        <Field>
          <FieldLabel htmlFor="financial-prepared">
            Are you financially prepared for food, vet care, vaccinations, and emergencies?
          </FieldLabel>
          <Textarea
            id="financial-prepared"
            placeholder="Describe your plan for covering regular and unexpected pet expenses."
            rows={4}
            disabled={disabled}
            aria-invalid={!!errors.adoptionCommitment?.financiallyPrepared}
            {...register("adoptionCommitment.financiallyPrepared")}
          />
          <FieldError errors={[errors.adoptionCommitment?.financiallyPrepared]} />
        </Field>

        {/* Plan for adjustment period */}
        <Field>
          <FieldLabel htmlFor="time-commitment">
            What is your plan for the adjustment/training period?
          </FieldLabel>
          <Textarea
            id="time-commitment"
            placeholder="How will you help this pet settle in? Any training plans, vet visits, or adjustment strategies?"
            rows={4}
            disabled={disabled}
            aria-invalid={!!errors.adoptionCommitment?.timeCommitment}
            {...register("adoptionCommitment.timeCommitment")}
          />
          <FieldError errors={[errors.adoptionCommitment?.timeCommitment]} />
        </Field>

        {/* Commit to vet care */}
        <Field>
          <FieldLabel htmlFor="commit-vet-care">
            Can you commit to regular vet visits and vaccinations if needed?
          </FieldLabel>
          <Select
            value={commitToVetCare === undefined ? undefined : commitToVetCare ? "YES" : "NO"}
            onValueChange={(val) =>
              setValue("adoptionCommitment.commitToVetCare", val === "YES", {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            disabled={disabled}
          >
            <SelectTrigger id="commit-vet-care" aria-invalid={!!errors.adoptionCommitment?.commitToVetCare}>
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="YES">Yes</SelectItem>
              <SelectItem value="NO">No</SelectItem>
            </SelectContent>
          </Select>
          <FieldError errors={[errors.adoptionCommitment?.commitToVetCare]} />
        </Field>

        {/* Additional Info */}
        <Field>
          <FieldLabel htmlFor="additional-info">
            Anything else you want the shelter/owner to know? (Optional)
          </FieldLabel>
          <Textarea
            id="additional-info"
            placeholder="Provide any additional context or information that might support your application."
            rows={3}
            disabled={disabled}
            aria-invalid={!!errors.adoptionCommitment?.additionalInfo}
            {...register("adoptionCommitment.additionalInfo")}
          />
          <FieldError errors={[errors.adoptionCommitment?.additionalInfo]} />
        </Field>
      </div>
    </div>
  )
}
