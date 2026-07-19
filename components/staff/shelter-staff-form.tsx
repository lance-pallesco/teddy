"use client"

import { useMemo, useTransition, useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import Link from "next/link"
import Image from "next/image"
import {
  User2Icon,
  UploadIcon,
  Loader2Icon,
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  LockIcon,
  SparklesIcon,
  Trash2Icon,
  CameraIcon,
  Building2Icon,
} from "lucide-react"

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
import { uploadAvatar } from "@/lib/uploads/upload-avatar.client"
import { validateImageFile } from "@/lib/uploads/validate-image-file"
import { cn } from "@/lib/utils"

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

  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      avatar: "",
    },
  })

  const watchedValues = useWatch({ control })
  const selectedGender = watchedValues.gender ?? "OTHER"
  const selectedShelterId = watchedValues.shelterId ?? ""
  const avatarValue = watchedValues.avatar ?? ""

  const selectedShelterName = useMemo(() => {
    return shelters.find((shelter) => shelter.id === selectedShelterId)?.name ?? ""
  }, [shelters, selectedShelterId])
  const isShelterLocked = Boolean(preselectedShelterId)

  // Revoke blob URL on unmount
  useEffect(() => {
    return () => {
      if (localPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(localPreview)
      }
    }
  }, [localPreview])

  function clearLocalPreview() {
    if (localPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(localPreview)
    }
    setLocalPreview(null)
  }

  async function handleFileChange(file: File | undefined) {
    if (!file || isPending) return

    const validationError = validateImageFile(file)
    if (validationError) {
      toast.error(validationError)
      return
    }

    clearLocalPreview()
    const objectUrl = URL.createObjectURL(file)
    setLocalPreview(objectUrl)
    setIsUploading(true)

    try {
      const url = await uploadAvatar(file)
      clearLocalPreview()
      setValue("avatar", url, { shouldDirty: true, shouldValidate: true })
      toast.success("Profile photo uploaded successfully")
    } catch (error) {
      clearLocalPreview()
      toast.error(error instanceof Error ? error.message : "Profile photo upload failed")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
    if (isPending) return
    const file = event.dataTransfer.files?.[0]
    if (file) {
      void handleFileChange(file)
    }
  }

  function handleRemovePhoto(event: React.MouseEvent) {
    event.stopPropagation()
    clearLocalPreview()
    setValue("avatar", "", { shouldDirty: true, shouldValidate: true })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    toast.success("Profile photo removed")
  }

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

  const activePreviewSrc = localPreview ?? avatarValue ?? null

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      <div className="grid gap-6 lg:grid-cols-3 items-start">

        {/* Left Column: Interactive Staff Card & Upload */}
        <div className="lg:col-span-1">
          <Card className="overflow-hidden border-primary/15 bg-white shadow-xs">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
               Profile Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">

              {/* Uploader drag-and-drop container */}
              <div
                onDragEnter={(e) => {
                  e.preventDefault()
                  if (!isPending) setIsDragging(true)
                }}
                onDragOver={(e) => e.preventDefault()}
                onDragLeave={(e) => {
                  e.preventDefault()
                  setIsDragging(false)
                }}
                onDrop={handleDrop}
                onClick={() => {
                  if (!isPending && !isUploading) {
                    fileInputRef.current?.click()
                  }
                }}
                className={cn(
                  "relative flex aspect-square w-full flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden bg-muted/5",
                  isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20 hover:border-primary/50",
                  isUploading && "pointer-events-none opacity-80"
                )}
              >
                {activePreviewSrc ? (
                  <>
                    <Image
                      src={activePreviewSrc}
                      alt="Profile Preview"
                      fill
                      className="object-cover"
                      unoptimized={activePreviewSrc.startsWith("/uploads/")}
                    />
                    <div className="absolute top-2 right-2">
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="size-7 rounded-lg shadow-sm"
                        onClick={handleRemovePhoto}
                        disabled={isPending || isUploading}
                      >
                        <Trash2Icon className="size-3.5" />
                      </Button>
                    </div>
                  </>
                ) : isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2Icon className="size-8 text-primary animate-spin" />
                    <span className="text-xs text-muted-foreground font-medium">Uploading photo...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2.5 text-muted-foreground text-center p-4">
                    <div className="rounded-full bg-primary/5 p-3 text-primary border border-primary/10">
                      <CameraIcon className="size-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-foreground">Drag & drop avatar here</p>
                      <p className="text-[10px]">or click to select file (max 2MB)</p>
                    </div>
                  </div>
                )}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleFileChange(e.target.files?.[0])}
                className="hidden"
                accept="image/*"
                disabled={isPending || isUploading}
              />

              {errors.avatar && (
                <p className="text-xs font-medium text-destructive">{errors.avatar.message}</p>
              )}

              {/* Real-time textual profile preview */}
              <div className="pt-4 space-y-3.5 border-t">
                <div className="text-center space-y-1">
                  <h4 className="font-bold text-lg text-foreground truncate px-2">
                    {watchedValues.firstName || watchedValues.lastName
                      ? `${watchedValues.firstName || ""} ${watchedValues.lastName || ""}`.trim()
                      : ""}
                  </h4>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#8B7E74]/10 text-[#3D3C3A] border border-[#8B7E74]/20 uppercase">
                    Shelter Staff
                  </span>
                </div>

                <div className="space-y-2.5 text-xs text-muted-foreground pl-1">
                  <div className="flex items-center gap-2">
                    <Building2Icon className="size-3.5 text-primary shrink-0" />
                    <span className="truncate font-semibold text-foreground/80">
                      {selectedShelterName || "No shelter preselected"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MailIcon className="size-3.5 text-primary shrink-0" />
                    <span className="truncate">{watchedValues.email || "staff@example.com"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="size-3.5 text-primary shrink-0" />
                    <span>{watchedValues.phone || "No phone number"}</span>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Right Columns: Form Inputs */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-primary/15 bg-white shadow-xs">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-bold text-foreground">
                Account Details
              </CardTitle>
              <CardDescription>
                Provide credentials and demographic info. Staff roles are managed under the SHELTER_STAFF system type.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col gap-6">
                <FieldGroup>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor="first-name">First Name</FieldLabel>
                      <Input
                        id="first-name"
                        autoComplete="given-name"
                        aria-invalid={!!errors.firstName}
                        className="bg-background"
                        disabled={isPending}
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
                        disabled={isPending}
                        {...register("lastName")}
                      />
                      <FieldError errors={[errors.lastName]} />
                    </Field>
                  </div>

                  <Field>
                    <FieldLabel htmlFor="shelter">Associated Shelter</FieldLabel>
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
                              : "Select associated shelter"
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
                    <FieldLabel htmlFor="email">Email Address</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      aria-invalid={!!errors.email}
                      className="bg-background"
                      disabled={isPending}
                      {...register("email")}
                    />
                    <FieldError errors={[errors.email]} />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                      <Input
                        id="phone"
                        inputMode="numeric"
                        autoComplete="tel"
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
                      disabled={isPending}
                      {...register("address")}
                    />
                    <FieldError errors={[errors.address]} />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="password">Temporary Password</FieldLabel>
                    <Input
                      id="password"
                      type="password"
                      autoComplete="new-password"
                      aria-invalid={!!errors.password}
                      className="bg-background"
                      disabled={isPending}
                      {...register("password")}
                    />
                    <FieldError errors={[errors.password]} />
                    <FieldDescription>
                      Minimum 8 characters, including 1 uppercase letter and 1 number.
                    </FieldDescription>
                  </Field>
                </FieldGroup>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end border-t pt-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="rounded-lg cursor-pointer transition-colors duration-200 hover:bg-neutral-50 hover:text-neutral-900 font-medium shadow-none text-sm h-10 px-4 py-2"
              asChild
              disabled={isPending}
            >
              <Link href={preselectedShelterId ? `/shelters/${preselectedShelterId}` : "/shelters"}>
                Cancel
              </Link>
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={isPending || isUploading}
              className="min-w-32 bg-[#AE8F65] text-white border-transparent hover:bg-[#9A7D58] hover:text-white cursor-pointer rounded-lg transition-colors duration-200 font-medium shadow-none text-sm h-10 px-4 py-2"
            >
              {isPending ? "Creating staff account..." : "Create Staff Account"}
            </Button>
          </div>

        </div>

      </div>
    </form>
  )
}
