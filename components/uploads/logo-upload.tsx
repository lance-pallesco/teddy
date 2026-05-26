"use client"

import { useEffect, useId, useRef, useState } from "react"
import Image from "next/image"
import { ImageIcon, Loader2, UploadIcon, XIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { uploadShelterLogo } from "@/lib/uploads/upload-shelter-logo.client"
import { validateImageFile } from "@/lib/uploads/validate-image-file"

type LogoUploadProps = {
  value?: string
  onChange: (url: string) => void
  disabled?: boolean
}

export function LogoUpload({ value, onChange, disabled }: LogoUploadProps) {
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
      const url = await uploadShelterLogo(file)
      clearLocalPreview()
      onChange(url)
      toast.success("Logo uploaded")
    } catch (error) {
      clearLocalPreview()
      toast.error(
        error instanceof Error ? error.message : "Logo upload failed. Please try again."
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
    <div className="flex flex-col gap-3">
      <div
        className={cn(
          "flex h-36 w-full items-center justify-center rounded-lg border border-dashed bg-muted/20",
          disabled && "opacity-60"
        )}
      >
        {previewSrc ? (
          <div className="relative size-28 overflow-hidden rounded-lg border bg-background">
            {isBlobPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewSrc}
                alt="Shelter logo preview"
                className="size-full object-cover"
              />
            ) : (
              <Image
                src={previewSrc}
                alt="Shelter logo preview"
                fill
                className="object-cover"
                unoptimized
              />
            )}
            {isUploading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : null}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <ImageIcon className="size-8" />
            <p className="text-sm">Upload a shelter logo</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
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
          {isUploading ? <Loader2 className="animate-spin" /> : <UploadIcon />}
          {isUploading ? "Uploading..." : previewSrc ? "Replace logo" : "Choose image"}
        </Button>
        {previewSrc ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || isUploading}
            onClick={handleRemove}
          >
            <XIcon />
            Remove
          </Button>
        ) : null}
      </div>

      <p className="text-xs text-muted-foreground">
        Optional. JPEG, PNG, WebP, or GIF up to 10MB.
      </p>
    </div>
  )
}
