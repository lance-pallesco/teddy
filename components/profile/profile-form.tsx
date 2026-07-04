"use client"

import { useTransition } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Lock, Save } from "lucide-react"

import { updateProfileSchema, type UpdateProfileInput } from "@/lib/validations/profile"
import { updateProfileAction } from "@/app/(dashboard)/profile/actions/profile.action"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { AvatarUpload } from "@/components/profile/avatar-upload"
import type { UserProfile } from "@/lib/services/user.service"

interface ProfileFormProps {
  user: UserProfile
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      gender: user.gender,
      address: user.address,
      avatar: user.avatar || "",
      dateOfBirth: user.dateOfBirth ? (() => {
        const d = new Date(user.dateOfBirth)
        const month = String(d.getMonth() + 1).padStart(2, "0")
        const day = String(d.getDate()).padStart(2, "0")
        return `${d.getFullYear()}-${month}-${day}`
      })() : "",
      occupation: user.occupation || "",
    },
  })

  function onSubmit(values: UpdateProfileInput) {
    startTransition(async () => {
      const response = await updateProfileAction(values)

      if (!response.success) {
        toast.error(response.message)
        return
      }

      toast.success("Profile updated successfully")
    })
  }

  // Generate initials for the avatar fallback
  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="flex flex-col gap-6">
        {/* Avatar Section */}
        <Field>
          <FieldLabel>Avatar Photo</FieldLabel>
          <Controller
            control={control}
            name="avatar"
            render={({ field }) => (
              <AvatarUpload
                value={field.value}
                onChange={field.onChange}
                disabled={isPending}
                initials={initials}
              />
            )}
          />
          <FieldError errors={[errors.avatar]} />
        </Field>

        <div className="grid gap-6 md:grid-cols-2">
          {/* First Name */}
          <Field>
            <FieldLabel htmlFor="firstName">First Name</FieldLabel>
            <Input
              id="firstName"
              placeholder="First name"
              disabled={isPending}
              aria-invalid={!!errors.firstName}
              {...register("firstName")}
            />
            <FieldError errors={[errors.firstName]} />
          </Field>

          {/* Last Name */}
          <Field>
            <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
            <Input
              id="lastName"
              placeholder="Last name"
              disabled={isPending}
              aria-invalid={!!errors.lastName}
              {...register("lastName")}
            />
            <FieldError errors={[errors.lastName]} />
          </Field>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Email Address */}
          <Field>
            <FieldLabel htmlFor="email">Email Address</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="johndoe@example.com"
              disabled={isPending}
              aria-invalid={!!errors.email}
              {...register("email")}
            />
            <FieldError errors={[errors.email]} />
          </Field>

          {/* Phone */}
          <Field>
            <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
            <Input
              id="phone"
              placeholder="e.g. 09123456789"
              disabled={isPending}
              aria-invalid={!!errors.phone}
              {...register("phone")}
            />
            <FieldError errors={[errors.phone]} />
          </Field>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Gender */}
          <Field>
            <FieldLabel htmlFor="gender">Gender</FieldLabel>
            <Controller
              control={control}
              name="gender"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isPending}
                >
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[errors.gender]} />
          </Field>

          {/* Date of Birth */}
          <Field>
            <FieldLabel htmlFor="dateOfBirth">Date of Birth</FieldLabel>
            <Input
              id="dateOfBirth"
              type="date"
              disabled={isPending}
              aria-invalid={!!errors.dateOfBirth}
              {...register("dateOfBirth")}
            />
            <FieldError errors={[errors.dateOfBirth]} />
          </Field>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Occupation */}
          <Field>
            <FieldLabel htmlFor="occupation">Occupation</FieldLabel>
            <Input
              id="occupation"
              placeholder="e.g. Software Engineer, Teacher"
              disabled={isPending}
              aria-invalid={!!errors.occupation}
              {...register("occupation")}
            />
            <FieldError errors={[errors.occupation]} />
          </Field>

          {/* Role (Read-Only) */}
          <Field>
            <FieldLabel className="flex items-center gap-1.5">
              Account Role <Lock className="size-3.5 text-muted-foreground" />
            </FieldLabel>
            <div className="flex h-9 items-center">
              <Badge variant="outline" className="px-3 py-1 font-medium capitalize bg-muted/20 border-muted-foreground/20">
                {user.role.toLowerCase().replace("_", " ")}
              </Badge>
            </div>
          </Field>
        </div>

        {/* Shelter Name (Read-Only) - Only for Shelter Staff */}
        {user.role === "SHELTER_STAFF" && user.shelterName && (
          <Field>
            <FieldLabel className="flex items-center gap-1.5">
              Associated Shelter <Lock className="size-3.5 text-muted-foreground" />
            </FieldLabel>
            <Input
              value={user.shelterName}
              disabled
              className="bg-muted/40 text-muted-foreground cursor-not-allowed border-muted-foreground/20"
            />
          </Field>
        )}

        {/* Address */}
        <Field>
          <FieldLabel htmlFor="address">Address</FieldLabel>
          <Textarea
            id="address"
            placeholder="Your full address"
            rows={3}
            disabled={isPending}
            aria-invalid={!!errors.address}
            {...register("address")}
          />
          <FieldError errors={[errors.address]} />
        </Field>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button type="submit" disabled={isPending} className="min-w-32">
          {isPending ? (
            "Saving..."
          ) : (
            <>
              <Save className="size-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
