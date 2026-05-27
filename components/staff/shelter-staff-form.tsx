"use client"

import { useMemo, useTransition } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"

import { createShelterStaffAction } from "@/app/(dashboard)/shelters/actions/create-shelter-staff"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  createShelterStaffSchema,
  type CreateShelterStaffFormInput,
} from "@/lib/validations/shelter-staff"

type ShelterOption = {
  id: string
  name: string
}

type ShelterStaffFormProps = {
  shelters: ShelterOption[]
  preselectedShelterId?: string
}

export function ShelterStaffForm({
  shelters,
  preselectedShelterId,
}: ShelterStaffFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<CreateShelterStaffFormInput>({
    resolver: zodResolver(createShelterStaffSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      gender: "OTHER",
      address: "",
      password: "",
      shelterId: preselectedShelterId ?? "",
    },
  })

  const selectedGender = useWatch({ control, name: "gender" })
  const selectedShelterId = useWatch({ control, name: "shelterId" })

  const selectedShelterName = useMemo(() => {
    return shelters.find((shelter) => shelter.id === selectedShelterId)?.name ?? ""
  }, [shelters, selectedShelterId])
  const isShelterLocked = Boolean(preselectedShelterId)

  function onSubmit(values: CreateShelterStaffFormInput) {
    startTransition(async () => {
      const response = await createShelterStaffAction(values)

      if (!response.success || !response.data) {
        toast.error(response.message)
        return
      }

      toast.success(response.message)

      const targetShelterId = response.data.shelterId
      router.push(targetShelterId ? `/shelters/${targetShelterId}` : "/shelters")
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Shelter Staff Account</CardTitle>
          <CardDescription>
            Staff accounts are created by Admin only and always have the <span className="font-medium">SHELTER_STAFF</span> role.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="first-name">First Name</FieldLabel>
                  <Input
                    id="first-name"
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
                    autoComplete="family-name"
                    aria-invalid={!!errors.lastName}
                    className="bg-background"
                    {...register("lastName")}
                  />
                  <FieldError errors={[errors.lastName]} />
                </Field>
              </div>
              
              <Field>
                <FieldLabel htmlFor="shelter">Shelter</FieldLabel>
                <Select
                  value={selectedShelterId}
                  onValueChange={(value) =>
                    setValue("shelterId", value, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  disabled={isPending || shelters.length === 0 || isShelterLocked}
                >
                  <SelectTrigger
                    id="shelter"
                    className="bg-background"
                    aria-invalid={!!errors.shelterId}
                  >
                    <SelectValue
                      placeholder={
                        shelters.length === 0
                          ? "No active shelters available"
                          : "Select a shelter"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {shelters.map((shelter) => (
                      <SelectItem key={shelter.id} value={shelter.id}>
                        {shelter.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[errors.shelterId]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  className="bg-background"
                  {...register("email")}
                />
                <FieldError errors={[errors.email]} />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="phone">Phone</FieldLabel>
                  <Input
                    id="phone"
                    inputMode="numeric"
                    autoComplete="tel"
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
                      setValue("gender", value as "MALE" | "FEMALE" | "OTHER", {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    disabled={isPending}
                  >
                    <SelectTrigger
                      id="gender"
                      className="bg-background"
                      aria-invalid={!!errors.gender}
                    >
                      <SelectValue placeholder="Select gender" />
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
                  autoComplete="street-address"
                  aria-invalid={!!errors.address}
                  className="bg-background"
                  {...register("address")}
                />
                <FieldError errors={[errors.address]} />
              </Field>

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
                  Minimum 8 characters, include 1 uppercase letter and 1 number.
                </FieldDescription>
              </Field>

              <Field>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Creating..." : "Create staff account"}
                </Button>
                {preselectedShelterId ? (
                  <FieldDescription>
                    Creating staff for <span className="font-medium">{selectedShelterName || "this shelter"}</span>.
                  </FieldDescription>
                ) : (
                  <FieldDescription>
                    Tip: use the shelter detail page for a preselected shelter.
                  </FieldDescription>
                )}
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

