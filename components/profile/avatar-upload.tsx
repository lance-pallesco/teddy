"use client"

import { useEffect, useId, useRef, useState } from "react"
import Image from "next/image"
import { Loader2, Camera, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { uploadAvatar } from "@/lib/uploads/upload-avatar.client"
import { validateImageFile } from "@/lib/uploads/validate-image-file"

type AvatarUploadProps = {
  value?: string
  onChange: (url: string) => void
  disabled?: boolean
  initials?: string
}

export function AvatarUpload({
  value,
  onChange,
  disabled,
  initials = "U",
}: AvatarUploadProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [localPreview, setLocalPreview] = useState<string | null>(null)

  const previewSrc = localPreview ?? value ?? null
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
    if (!file) {
      return
    }

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
      onChange(url)
      toast.success("Avatar uploaded successfully")
    } catch (error) {
      clearLocalPreview()
      toast.error(
        error instanceof Error ? error.message : "Avatar upload failed. Please try again."
      )
    } finally {
      setIsUploading(false)
      if (inputRef.current) {
        inputRef.current.value = ""
      }
    }
  }

  function handleRemove() {
    clearLocalPreview()
    onChange("")
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
      <div className="relative group/avatar-upload">
        <div
          className={cn(
            "relative flex size-28 items-center justify-center overflow-hidden rounded-full border bg-muted ring-offset-background transition-all duration-300 ring-2 ring-transparent group-hover/avatar-upload:ring-primary/20",
            disabled && "opacity-60"
          )}
        >
          {previewSrc ? (
            isBlobPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewSrc}
                alt="Avatar preview"
                className="size-full object-cover"
              />
            ) : (
              <Image
                src={previewSrc}
                alt="Avatar preview"
                fill
                className="object-cover"
                unoptimized
              />
            )
          ) : (
            <div className="flex size-full items-center justify-center bg-primary/5 text-2xl font-semibold text-primary uppercase">
              {initials}
            </div>
          )}

          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-[1px]">
              <Loader2 className="size-6 animate-spin text-primary" />
            </div>
          )}

          {/* Hover overlay to upload */}
          {!disabled && !isUploading && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white opacity-0 transition-opacity duration-300 group-hover/avatar-upload:opacity-100 cursor-pointer"
            >
              <Camera className="size-6 mb-1" />
              <span className="text-[10px] font-medium">Update</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 sm:items-start">
        <div className="flex flex-wrap gap-2">
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            disabled={disabled || isUploading}
            onChange={(event) => {
              void handleFileChange(event.target.files?.[0])
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || isUploading}
            onClick={() => inputRef.current?.click()}
          >
            Choose Image
          </Button>
          {previewSrc && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:bg-destructive/5 hover:text-destructive"
              disabled={disabled || isUploading}
              onClick={handleRemove}
            >
              <X className="size-4 mr-1" />
              Remove
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          JPG, PNG, WebP or GIF. Max 10MB.
        </p>
      </div>
    </div>
  )
}
