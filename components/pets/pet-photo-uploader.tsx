"use client"

import { useId, useRef, useState } from "react"
import Image from "next/image"
import {
  GripVerticalIcon,
  ImageIcon,
  Loader2Icon,
  StarIcon,
  UploadIcon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MAX_PET_IMAGES } from "@/lib/constants/pet"
import { uploadPetImage } from "@/lib/uploads/upload-pet-image.client"
import { validateImageFile } from "@/lib/uploads/validate-image-file"

export type PetPhotoItem = {
  id: string
  url: string
  previewUrl?: string
  isUploading?: boolean
}

type PetPhotoUploaderProps = {
  value: PetPhotoItem[]
  onChange: (items: PetPhotoItem[]) => void
  disabled?: boolean
}

function createLocalId() {
  return crypto.randomUUID()
}

export function PetPhotoUploader({ value, onChange, disabled }: PetPhotoUploaderProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const canAddMore = value.length < MAX_PET_IMAGES

  async function uploadFiles(files: FileList | File[]) {
    const fileArray = Array.from(files)

    if (fileArray.length === 0) {
      return
    }

    let currentItems = [...value]
    const remainingSlots = MAX_PET_IMAGES - currentItems.length

    if (remainingSlots <= 0) {
      toast.error(`You can upload up to ${MAX_PET_IMAGES} images.`)
      return
    }

    const filesToUpload = fileArray.slice(0, remainingSlots)

    if (fileArray.length > remainingSlots) {
      toast.error(`Only ${remainingSlots} more image(s) can be added.`)
    }

    for (const file of filesToUpload) {
      const validationError = validateImageFile(file)

      if (validationError) {
        toast.error(validationError)
        continue
      }

      const localId = createLocalId()
      const previewUrl = URL.createObjectURL(file)

      currentItems = [
        ...currentItems,
        {
          id: localId,
          url: "",
          previewUrl,
          isUploading: true,
        },
      ]
      onChange(currentItems)

      try {
        const url = await uploadPetImage(file)
        URL.revokeObjectURL(previewUrl)
        currentItems = currentItems.map((item) =>
          item.id === localId
            ? { id: localId, url, isUploading: false }
            : item
        )
        onChange(currentItems)
      } catch (error) {
        URL.revokeObjectURL(previewUrl)
        currentItems = currentItems.filter((item) => item.id !== localId)
        onChange(currentItems)
        toast.error(
          error instanceof Error ? error.message : "Photo upload failed. Please try again."
        )
      }
    }
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)

    if (disabled || !canAddMore) {
      return
    }

    void uploadFiles(event.dataTransfer.files)
  }

  function moveImage(index: number, direction: -1 | 1) {
    const targetIndex = index + direction

    if (targetIndex < 0 || targetIndex >= value.length) {
      return
    }

    const next = [...value]
    const [moved] = next.splice(index, 1)
    next.splice(targetIndex, 0, moved)
    onChange(next)
  }

  function removeImage(id: string) {
    const item = value.find((photo) => photo.id === id)

    if (item?.previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(item.previewUrl)
    }

    onChange(value.filter((photo) => photo.id !== id))
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        onDragEnter={(event) => {
          event.preventDefault()
          if (!disabled && canAddMore) {
            setIsDragging(true)
          }
        }}
        onDragOver={(event) => {
          event.preventDefault()
        }}
        onDragLeave={(event) => {
          event.preventDefault()
          setIsDragging(false)
        }}
        onDrop={handleDrop}
        className={cn(
          "flex min-h-40 flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/20 p-6 text-center transition-colors",
          isDragging && "border-primary bg-primary/5",
          (disabled || !canAddMore) && "opacity-60"
        )}
      >
        <ImageIcon className="size-8 text-muted-foreground" />
        <div className="space-y-1">
          <p className="text-sm font-medium">Drag and drop pet photos</p>
          <p className="text-xs text-muted-foreground">
            Up to {MAX_PET_IMAGES} images · JPEG, PNG, WebP, or GIF · 10MB each
          </p>
        </div>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="sr-only"
          disabled={disabled || !canAddMore}
          onChange={(event) => {
            const files = event.target.files

            if (files) {
              void uploadFiles(files)
            }

            event.target.value = ""
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || !canAddMore}
          onClick={() => inputRef.current?.click()}
        >
          <UploadIcon />
          Choose images
        </Button>
      </div>

      {value.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {value.map((item, index) => {
            const displaySrc = item.url || item.previewUrl
            const isPrimary = index === 0 && Boolean(item.url)

            return (
              <div
                key={item.id}
                className="relative overflow-hidden rounded-lg border bg-background"
              >
                <div className="relative aspect-4/3 bg-muted/30">
                  {displaySrc ? (
                    item.url ? (
                      <Image
                        src={displaySrc}
                        alt={`Pet photo ${index + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={displaySrc}
                        alt={`Pet photo ${index + 1}`}
                        className="size-full object-cover"
                      />
                    )
                  ) : null}
                  {item.isUploading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                      <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : null}
                </div>

                <div className="flex items-center justify-between gap-2 border-t p-2">
                  <div className="flex items-center gap-1">
                    {isPrimary ? (
                      <Badge variant="secondary" className="gap-1">
                        <StarIcon className="size-3" />
                        Primary
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">Photo {index + 1}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      disabled={disabled || item.isUploading || index === 0}
                      onClick={() => moveImage(index, -1)}
                      aria-label="Move photo earlier"
                    >
                      <GripVerticalIcon />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      disabled={disabled || item.isUploading || index === value.length - 1}
                      onClick={() => moveImage(index, 1)}
                      aria-label="Move photo later"
                    >
                      <GripVerticalIcon className="rotate-180" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      disabled={disabled || item.isUploading}
                      onClick={() => removeImage(item.id)}
                      aria-label="Remove photo"
                    >
                      <XIcon />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
