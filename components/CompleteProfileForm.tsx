"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import Image from "next/image"
import { z } from "zod"

import { completeGoogleRegistration, type CompleteProfileInput } from "@/app/(auth)/actions/complete-profile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { Gender } from "@prisma/client"

type CompleteProfileFormProps = {
  defaultProfile: {
    email: string
    firstName: string
    lastName: string
    avatar: string
  }
}

const completeProfileFormSchema = z.object({
  role: z.enum(["ADOPTER", "PET_OWNER"]),
  phone: z
    .string()
    .trim()
    .regex(/^\d{10,15}$/, "Phone must be 10 to 15 digits"),
  address: z.string().trim().min(1, "Address is required"),
  gender: z.nativeEnum(Gender),
})

type FormInputs = z.infer<typeof completeProfileFormSchema>

export function CompleteProfileForm({ defaultProfile }: CompleteProfileFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormInputs>({
    resolver: zodResolver(completeProfileFormSchema),
    defaultValues: {
      role: "ADOPTER",
      phone: "",
      address: "",
      gender: "OTHER",
    },
  })

  const selectedRole = useWatch({ control, name: "role" })
  const selectedGender = useWatch({ control, name: "gender" })

  function onSubmit(values: FormInputs) {
    startTransition(async () => {
      const response = await completeGoogleRegistration(values)

      if (!response.success) {
        toast.error(response.message)
        return
      }

      toast.success("Profile setup complete! Welcome to Teddy.")
      router.push("/dashboard")
      router.refresh()
    })
  }

  return (
    <Card className="border-primary/15 bg-white shadow-xs">
      <CardHeader className="text-center pb-4 border-b">
        <div className="flex flex-col items-center gap-3">
          {defaultProfile.avatar ? (
            <div className="relative size-16 rounded-full border border-primary/20 bg-muted overflow-hidden">
              <Image
                src={defaultProfile.avatar}
                alt={`${defaultProfile.firstName} ${defaultProfile.lastName}`}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/5 text-primary text-xl font-bold border border-primary/10">
              {defaultProfile.firstName?.[0] || "U"}
            </div>
          )}
          <div>
            <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
            <CardDescription className="text-sm mt-1">
              Logged in as <span className="font-semibold text-foreground">{defaultProfile.email}</span>. Fill in the remaining required fields to create your account.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FieldGroup>
            
            {/* 1. Interactive Role Choices */}
            <Field>
              <FieldLabel className="text-sm font-semibold mb-2">Choose Your Role</FieldLabel>
              <div className="grid gap-4 sm:grid-cols-2">
                
                {/* Adopter Card */}
                <div
                  className={cn(
                    "border rounded-xl p-4 cursor-pointer transition-all hover:border-[#AE8F65]/50 flex flex-col justify-between text-left h-full",
                    selectedRole === "ADOPTER"
                      ? "border-[#AE8F65] bg-[#AE8F65]/5 ring-1 ring-[#AE8F65]"
                      : "border-border bg-background"
                  )}
                  onClick={() => setValue("role", "ADOPTER", { shouldDirty: true, shouldValidate: true })}
                >
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-foreground">Adopter</h4>
                    <p className="text-[11px] text-muted-foreground leading-normal">
                      Browse available companion animals, find local shelter matches, and submit adoption applications.
                    </p>
                  </div>
                </div>

                {/* Pet Owner Card */}
                <div
                  className={cn(
                    "border rounded-xl p-4 cursor-pointer transition-all hover:border-[#AE8F65]/50 flex flex-col justify-between text-left h-full",
                    selectedRole === "PET_OWNER"
                      ? "border-[#AE8F65] bg-[#AE8F65]/5 ring-1 ring-[#AE8F65]"
                      : "border-border bg-background"
                  )}
                  onClick={() => setValue("role", "PET_OWNER", { shouldDirty: true, shouldValidate: true })}
                >
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-foreground">Pet Owner</h4>
                    <p className="text-[11px] text-muted-foreground leading-normal">
                      List foster or rehome pets for adoption, log vaccination logs, and review incoming applications.
                    </p>
                  </div>
                </div>

              </div>
              <FieldError errors={[errors.role]} />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="first-name">First Name</FieldLabel>
                <Input
                  id="first-name"
                  type="text"
                  value={defaultProfile.firstName}
                  disabled
                  className="bg-muted opacity-80"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="last-name">Last Name</FieldLabel>
                <Input
                  id="last-name"
                  type="text"
                  value={defaultProfile.lastName}
                  disabled
                  className="bg-muted opacity-80"
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                <Input
                  id="phone"
                  placeholder="e.g. 09XXXXXXXXX"
                  autoComplete="tel"
                  inputMode="numeric"
                  aria-invalid={!!errors.phone}
                  className="bg-background"
                  disabled={isPending}
                  {...register("phone")}
                />
                <FieldError errors={[errors.phone]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="gender">Gender</FieldLabel>
                <Select
                  value={selectedGender}
                  onValueChange={(value) =>
                    setValue("gender", value as "MALE" | "FEMALE" | "OTHER", {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  disabled={isPending}
                >
                  <SelectTrigger id="gender" className="bg-background" aria-invalid={!!errors.gender}>
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FieldError errors={[errors.gender]} />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="address">Address</FieldLabel>
              <Input
                id="address"
                placeholder="e.g. 82 J.P. Street Metro Manila"
                autoComplete="street-address"
                aria-invalid={!!errors.address}
                className="bg-background"
                disabled={isPending}
                {...register("address")}
              />
              <FieldError errors={[errors.address]} />
            </Field>

            <Field className="pt-2">
              <Button type="submit" disabled={isPending} className="w-full bg-[#AE8F65] hover:bg-[#9A7D58] text-white">
                {isPending ? "Configuring profile..." : "Complete Registration"}
              </Button>
            </Field>

          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
