"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"

import { registerUser } from "@/app/(auth)/actions/register"
import { cn } from "@/lib/utils"
import {
  registerSchema,
  type RegisterFormInput,
} from "@/lib/validations/auth"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "./ui/select"
import Link from "next/link"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<RegisterFormInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      gender: "",
      address: "",
      password: "",
      confirmPassword: "",
      role: "ADOPTER",
    },
  })
  const selectedRole = useWatch({ control, name: "role" })
  const selectedGender = useWatch({ control, name: "gender" })

  function onSubmit(values: RegisterFormInput) {
    startTransition(async () => {
      const response = await registerUser(values)

      if (!response.success) {
        toast.error("Unable to create account. Please try again.")
        return
      }

      toast.success("Account created successfully!")
      router.push("/login")
    })
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Fill in the form below to create your account
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="first-name">First Name</FieldLabel>
            <Input
              id="first-name"
              type="text"
              placeholder="John"
              autoComplete="given-name"
              aria-invalid={!!errors.firstName}
              className="bg-background"
              {...register("firstName")}
            />
            <FieldError errors={[errors.firstName]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="last-name">Last Name</FieldLabel>
            <Input
              id="last-name"
              type="text"
              placeholder="Doe"
              autoComplete="family-name"
              aria-invalid={!!errors.lastName}
              className="bg-background"
              {...register("lastName")}
            />
            <FieldError errors={[errors.lastName]} />
          </Field>
        </div>
        <Field>
          <FieldLabel className="text-sm mb-2">Role</FieldLabel>
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
                <h4 className=" text-sm text-foreground">Adopter</h4>
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
                <h4 className="text-sm text-foreground">Pet Owner</h4>
                <p className="text-[11px] text-muted-foreground leading-normal">
                  Rehome a pet, keep records, and manage adoption requests.
                </p>
              </div>
            </div>
          </div>
          <FieldError errors={[errors.role]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            autoComplete="email"
            aria-invalid={!!errors.email}
            className="bg-background"
            {...register("email")}
          />
          <FieldError errors={[errors.email]} />
          <FieldDescription>
            We&apos;ll use this to contact you. We will not share your email
            with anyone else.
          </FieldDescription>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
            <Input
              id="phone"
              type="text"
              placeholder="e.g. 09XXXXXXXXX"
              autoComplete="tel"
              inputMode="numeric"
              aria-invalid={!!errors.phone}
              className="bg-background"
              {...register("phone")}
            />
            <FieldError errors={[errors.phone]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="gender">Gender</FieldLabel>
            <Select
              value={selectedGender}
              onValueChange={(value) =>
                setValue("gender", value, { shouldDirty: true, shouldValidate: true })
              }
            >
              <SelectTrigger id="gender" className="bg-background" aria-invalid={!!errors.gender}>
                <SelectValue placeholder="Select Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">Male</SelectItem>
                <SelectItem value="FEMALE">Female</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
                <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
            <FieldError errors={[errors.gender]} />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="address">Address</FieldLabel>
          <Input
            id="address"
            type="text"
            placeholder="e.g. 82 J.P. Street Metro Manila"
            autoComplete="street-address"
            aria-invalid={!!errors.address}
            className="bg-background"
            {...register("address")}
          />
          <FieldError errors={[errors.address]} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              className="bg-background"
              {...register("password")}
            />
            <FieldError errors={[errors.password]} />
            <FieldDescription>
              Must be at least 8 characters long.
            </FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              aria-invalid={!!errors.confirmPassword}
              className="bg-background"
              {...register("confirmPassword")}
            />
            <FieldError errors={[errors.confirmPassword]} />
            <FieldDescription>Please confirm your password.</FieldDescription>
          </Field>
        </div>
        <Field>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Creating account..." : "Create Account"}
          </Button>
        </Field>
        <FieldSeparator>Or continue with</FieldSeparator>
        <Field>
          <Button
            variant="outline"
            type="button"
            onClick={() => {
              window.location.href = "/api/auth/google"
            }}
          >
            <svg className="size-4 shrink-0 mr-1.5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>
          <FieldDescription className="px-6 text-center">
            Already have an account? <Link href="/login">Sign in</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
