"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Building2Icon,
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  PencilIcon,
  InfoIcon,
  ImageIcon,
  Loader2Icon,
} from "lucide-react"
import { toast } from "sonner"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShelterStatusActions } from "@/components/shelters/shelter-status-actions"
import { cn } from "@/lib/utils"
import { uploadShelterLogo } from "@/lib/uploads/upload-shelter-logo.client"
import { validateImageFile } from "@/lib/uploads/validate-image-file"
import type { ShelterFormRecord } from "@/lib/services/shelter.service"

type ShelterSummaryCardProps =
  | {
    variant: "view"
    shelter: Partial<ShelterFormRecord>
    stats?: { petsCount: number; staffCount: number }
    logoValue?: undefined
    onLogoChange?: undefined
    logoError?: string
    disabled?: boolean
  }
  | {
    variant: "preview"
    shelter: Partial<ShelterFormRecord>
    stats?: { petsCount: number; staffCount: number }
    logoValue: string | null
    onLogoChange: (url: string) => void
    logoError?: string
    disabled?: boolean
  }
  | {
    variant: "new"
    shelter: Partial<ShelterFormRecord>
    stats?: undefined
    logoValue: string | null
    onLogoChange: (url: string) => void
    logoError?: string
    disabled?: boolean
  }

export function ShelterSummaryCard(props: ShelterSummaryCardProps) {
  const { variant, shelter, stats, logoValue, onLogoChange, logoError, disabled } = props

  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const previewSrc = localPreview ?? logoValue ?? shelter.logo ?? null
  const isBlobPreview = previewSrc?.startsWith("blob:") ?? false

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
    if (!file || disabled || !onLogoChange) return

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
      const url = await uploadShelterLogo(file)
      clearLocalPreview()
      onLogoChange(url)
      toast.success("Logo uploaded successfully")
    } catch (error) {
      clearLocalPreview()
      toast.error(error instanceof Error ? error.message : "Logo upload failed")
    } finally {
      setIsUploading(false)
      if (inputRef.current) {
        inputRef.current.value = ""
      }
    }
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
    if (disabled || !onLogoChange) return
    const file = event.dataTransfer.files?.[0]
    if (file) {
      void handleFileChange(file)
    }
  }

  function handleRemove(event: React.MouseEvent) {
    event.stopPropagation()
    if (!onLogoChange) return
    clearLocalPreview()
    onLogoChange("")
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  const renderLogoBox = () => {
    if (onLogoChange) {
      return (
        <div className="flex flex-col gap-2">
          <div
            onDragEnter={(e) => {
              e.preventDefault()
              if (!disabled) setIsDragging(true)
            }}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={(e) => {
              e.preventDefault()
              setIsDragging(false)
            }}
            onDrop={handleDrop}
            onClick={() => {
              if (!disabled && !isUploading) {
                inputRef.current?.click()
              }
            }}
            className={cn(
              "relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-dashed bg-muted/20 flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer text-center p-4",
              isDragging && "border-primary bg-primary/5",
              disabled && "opacity-60 cursor-not-allowed",
              logoError && "border-destructive ring-1 ring-destructive"
            )}
          >
            {previewSrc ? (
              <>
                {isBlobPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewSrc}
                    alt="Shelter logo preview"
                    className="size-full object-cover rounded-md"
                  />
                ) : (
                  <Image
                    src={previewSrc}
                    alt="Shelter logo preview"
                    fill
                    className="object-cover rounded-md"
                    unoptimized
                  />
                )}
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                    <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground p-4">
                <ImageIcon className="size-8 opacity-60" />
                <p className="text-xs font-semibold">Drag & drop logo here</p>
                <p className="text-[10px] text-muted-foreground">or click to browse</p>
              </div>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              disabled={disabled || isUploading}
              onChange={(e) => void handleFileChange(e.target.files?.[0])}
            />
          </div>

          {previewSrc && (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="xs"
                disabled={disabled || isUploading}
                onClick={() => inputRef.current?.click()}
                className="flex-1 cursor-pointer rounded-lg text-xs"
              >
                Replace logo
              </Button>
              <Button
                type="button"
                variant="outline"
                size="xs"
                disabled={disabled || isUploading}
                onClick={handleRemove}
                className="flex-1 cursor-pointer rounded-lg text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                Remove
              </Button>
            </div>
          )}

          {logoError && (
            <p className="text-xs text-destructive mt-0.5">{logoError}</p>
          )}
        </div>
      )
    }

    return (
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted border">
        {shelter.logo ? (
          <Image
            src={shelter.logo}
            alt={shelter.name ?? "Shelter"}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 30vw"
            unoptimized={shelter.logo.startsWith("/uploads/")}
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <Building2Icon className="size-10 opacity-60" />
            <span className="text-xs">No Logo Uploaded</span>
          </div>
        )}
      </div>
    )
  }

  if (variant === "new") {
    return (
      <Card className="lg:sticky lg:top-6 border-primary/15 bg-muted/20 overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
            New Shelter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderLogoBox()}

          <div className="space-y-2">
            {shelter.name && (
              <h3 className="text-xl font-bold tracking-tight text-foreground/60 truncate">
                {shelter.name}
              </h3>
            )}
            <p className="text-sm leading-relaxed text-muted-foreground text-justify">
              {shelter.description || "Fill out the form to register a new shelter profile. Once created, you can assign staff members and begin managing pet listings."}
            </p>
          </div>

          <div className="space-y-2 border-t pt-3">
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <InfoIcon className="size-3.5 text-primary shrink-0 mt-0.5" />
              <span>All fields marked as required must be completed before submitting.</span>
            </div>
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <InfoIcon className="size-3.5 text-primary shrink-0 mt-0.5" />
              <span>Drag & drop or click the area above to upload the shelter logo.</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const statusLabel = shelter.isActive ? "Active" : "Inactive"

  return (
    <Card className="lg:sticky lg:top-6 border-primary/15 bg-muted/20 overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
          {variant === "view" ? "Shelter Profile" : "Current Details"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {renderLogoBox()}

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xl font-bold tracking-tight truncate">{shelter.name || "Shelter Name"}</h3>
            <Badge variant={shelter.isActive ? "success" : "secondary"}>
              {statusLabel}
            </Badge>
          </div>

          {shelter.description && (
            <p className="text-sm leading-relaxed text-muted-foreground text-justify">
              {shelter.description}
            </p>
          )}

          <div className="space-y-1.5 pt-3 text-xs text-muted-foreground border-t">
            <div className="flex items-start gap-1.5">
              <MapPinIcon className="size-3.5 text-primary shrink-0 mt-0.5" />
              <span>
                {shelter.address || "Address"}
                {shelter.barangay && `, ${shelter.barangay}`}
                {shelter.city && `, ${shelter.city}`}
                {shelter.province && `, ${shelter.province}`}
                {shelter.postalCode && ` ${shelter.postalCode}`}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <PhoneIcon className="size-3.5 text-primary shrink-0" />
              <span>{shelter.phone || "Phone number"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MailIcon className="size-3.5 text-primary shrink-0" />
              <span>{shelter.email || "Email address"}</span>
            </div>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-2 gap-2 border-t pt-3 text-center">
            <div className="rounded-lg bg-background p-2 border">
              <p className="text-lg font-bold text-foreground">{stats.petsCount}</p>
              <p className="text-[10px] uppercase font-semibold text-muted-foreground">
                Pets Listed
              </p>
            </div>
            <div className="rounded-lg bg-background p-2 border">
              <p className="text-lg font-bold text-foreground">{stats.staffCount}</p>
              <p className="text-[10px] uppercase font-semibold text-muted-foreground">
                Staff Members
              </p>
            </div>
          </div>
        )}

        {variant === "view" && (
          <div className="space-y-2 border-t pt-3">
            <Button
              asChild
              size="sm"
              variant="outline"
              className="w-full rounded-lg border-transparent text-[#AE8F65] bg-[#AE8F65]/10 hover:bg-[#AE8F65]/20 hover:text-[#AE8F65] font-medium shadow-none cursor-pointer text-xs h-8"
            >
              <Link href={`/shelters/${shelter.id}/edit`} className="gap-1.5 justify-center w-full">
                <PencilIcon className="size-3.5" />
                Edit Shelter
              </Link>
            </Button>
            <ShelterStatusActions
              shelterId={shelter.id!}
              isActive={shelter.isActive!}
              size="sm"
              className="rounded-lg shadow-none font-medium h-8 text-xs cursor-pointer w-full justify-center"
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
