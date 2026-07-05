"use client"

import Link from "next/link"
import { AlertCircle, ShieldCheck, UserCheck } from "lucide-react"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

interface UserProfileData {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  occupation: string | null
  dateOfBirth: Date | null
}

interface Step1VerifyDetailsProps {
  user: UserProfileData
  disabled?: boolean
}

export function Step1VerifyDetails({ user }: Step1VerifyDetailsProps) {
  // Compute age
  let age: number | null = null
  if (user.dateOfBirth) {
    const birthDate = new Date(user.dateOfBirth)
    const today = new Date()
    age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
  }

  const isDobMissing = !user.dateOfBirth
  const isUnderage = age !== null && age < 18

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Verify Personal Details</h3>
        <p className="text-sm text-muted-foreground">
          Adoption applications require a verified identity. Please confirm your profile details below.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel>Full Name</FieldLabel>
          <Input value={`${user.firstName} ${user.lastName}`} disabled readOnly className="bg-muted/30" />
        </Field>

        <Field>
          <FieldLabel>Email Address</FieldLabel>
          <Input value={user.email} disabled readOnly className="bg-muted/30" />
        </Field>

        <Field>
          <FieldLabel>Phone Number</FieldLabel>
          <Input value={user.phone} disabled readOnly className="bg-muted/30" />
        </Field>

        <Field>
          <FieldLabel>Current Address</FieldLabel>
          <Input value={user.address} disabled readOnly className="bg-muted/30" />
        </Field>

        <Field>
          <FieldLabel>Occupation</FieldLabel>
          <Input value={user.occupation ?? "Not provided"} disabled readOnly className="bg-muted/30" />
        </Field>

        <Field>
          <FieldLabel>18+ Verification Status</FieldLabel>
          <div className="flex items-center gap-2">
            <Input
              value={
                isDobMissing
                  ? "Date of birth required"
                  : isUnderage
                    ? `Not eligible (${age} years old)`
                    : `Confirmed (${age} years old)`
              }
              disabled
              readOnly
              className="bg-muted/30 flex-1"
            />
          </div>
        </Field>
      </div>

      {/* Warning Alert Boxes */}
      {isDobMissing && (
        <div className="flex gap-3 rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm text-warning-foreground">
          <AlertCircle className="size-5 shrink-0 text-warning" />
          <div className="space-y-1">
            <p className="font-semibold">Date of birth required</p>
            <p>
              Please update your profile with your date of birth before continuing with the application.
            </p>
          </div>
        </div>
      )}

      {isUnderage && (
        <div className="flex gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive-foreground">
          <AlertCircle className="size-5 shrink-0 text-destructive" />
          <div className="space-y-1">
            <p className="font-semibold">Age requirement not met</p>
            <p>You must be 18 or older to apply for pet adoption.</p>
          </div>
        </div>
      )}

      {!isDobMissing && !isUnderage && (
        <div className="flex gap-3 rounded-lg border border-green-200 bg-green-50/50 p-4 text-sm text-green-800 dark:border-green-950 dark:bg-green-950/20 dark:text-green-300">
          <ShieldCheck className="size-5 shrink-0 text-green-600 dark:text-green-400" />
          <div className="space-y-1">
            <p className="font-semibold">Identity Verified</p>
            <p>Your profile meets the initial criteria. You may proceed to the next step.</p>
          </div>
        </div>
      )}

      <div className="text-xs text-muted-foreground border-t pt-4">
        To update your personal information, please visit your{" "}
        <Link href="/profile" className="text-primary font-medium hover:underline">
          Profile Settings
        </Link>
        .
      </div>
    </div>
  )
}
