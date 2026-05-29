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
          <FieldLabel htmlFor="role">Role</FieldLabel>
          <Select
            value={selectedRole ?? "ADOPTER"}
            onValueChange={(value: "ADOPTER" | "PET_OWNER") =>
              setValue("role", value, { shouldDirty: true, shouldValidate: true })
            }
          >
            <SelectTrigger id="role" className="bg-background" aria-invalid={!!errors.role}>
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ADOPTER">Adopter</SelectItem>
              <SelectItem value="PET_OWNER">Pet Owner</SelectItem>
            </SelectContent>
          </Select>
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
          <Button variant="outline" type="button">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                fill="currentColor"
              />
            </svg>
            Sign up with GitHub
          </Button>
          <FieldDescription className="px-6 text-center">
            Already have an account? <Link href="/login">Sign in</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
