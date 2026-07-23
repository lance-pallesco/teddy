"use client"

import { useEffect, useRef, useState } from "react"
import SignatureCanvas from "react-signature-canvas"
import { useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { TrashIcon, CheckIcon, PenTool, Upload } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface SignaturePadProps {
  applicationId: string
  defaultValue?: string | null
  onSignatureSaved: (url: string) => void
  disabled?: boolean
}

export function SignaturePad({
  applicationId,
  defaultValue,
  onSignatureSaved,
  disabled = false,
}: SignaturePadProps) {
  const [mounted, setMounted] = useState(false)
  const [isSaved, setIsSaved] = useState(!!defaultValue)
  const [signatureUrl, setSignatureUrl] = useState<string | null>(defaultValue ?? null)
  const [activeTab, setActiveTab] = useState<"draw" | "upload">("draw")
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  
  const sigPadRef = useRef<SignatureCanvas>(null)
  const { setValue } = useFormContext()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-40 w-full rounded-md border bg-muted/20 animate-pulse" />
  }

  const handleClear = () => {
    sigPadRef.current?.clear()
    setValue("signatureBase64", null)
    setValue("signatureSigned", false, { shouldValidate: true })
  }

  const handleEnd = () => {
    if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
      const base64 = sigPadRef.current.getCanvas().toDataURL("image/png")
      setValue("signatureBase64", base64)
      setValue("signatureSigned", true, { shouldValidate: true })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, or JPEG)")
      return
    }

    // Limit file size to 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file is too large. Max size is 5MB.")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      setUploadedImage(base64)
      setValue("signatureBase64", base64)
      setValue("signatureSigned", true, { shouldValidate: true })
    }
    reader.readAsDataURL(file)
  }

  const handleTabChange = (tab: "draw" | "upload") => {
    setActiveTab(tab)
    setValue("signatureBase64", null)
    setValue("signatureSigned", false, { shouldValidate: true })
    setUploadedImage(null)
    setTimeout(() => {
      sigPadRef.current?.clear()
    }, 50)
  }

  const handleChangeSignature = () => {
    setIsSaved(false)
    setValue("signatureBase64", null)
    setValue("signatureSigned", false, { shouldValidate: true })
    setUploadedImage(null)
    onSignatureSaved("")
  }

  if (isSaved && signatureUrl) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border bg-muted/10 p-6">
        <div className="relative h-28 w-full max-w-md border rounded bg-white p-2">
          <Image
            src={signatureUrl}
            alt="Digital Signature"
            fill
            className="object-contain"
            unoptimized
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs text-green-600 font-semibold">
            <CheckIcon className="size-3.5" />
            Signature Confirmed
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={handleChangeSignature}
            className="text-muted-foreground hover:text-foreground h-8"
          >
            Change Signature
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Tabs selector */}
      <div className="flex border-b border-border">
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleTabChange("draw")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 border-b-2 text-xs font-semibold -mb-px transition-colors cursor-pointer disabled:opacity-50",
            activeTab === "draw"
              ? "border-[#AE8F65] text-[#AE8F65]"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <PenTool className="size-3.5" />
          Draw Signature
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleTabChange("upload")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 border-b-2 text-xs font-semibold -mb-px transition-colors cursor-pointer disabled:opacity-50",
            activeTab === "upload"
              ? "border-[#AE8F65] text-[#AE8F65]"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Upload className="size-3.5" />
          Upload Signature Image
        </button>
      </div>

      {/* Draw Tab content */}
      {activeTab === "draw" && (
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-lg border bg-white dark:bg-zinc-900 shadow-inner">
            <SignatureCanvas
              ref={sigPadRef}
              penColor="black"
              onEnd={handleEnd}
              canvasProps={{
                className: "w-full h-40 cursor-crosshair",
                style: { minHeight: "160px" },
              }}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={handleClear}
            >
              <TrashIcon className="size-4 mr-2" />
              Clear Pad
            </Button>
          </div>
        </div>
      )}

      {/* Upload Tab content */}
      {activeTab === "upload" && (
        <div className="space-y-3">
          {uploadedImage ? (
            <div className="flex flex-col items-center gap-4 rounded-lg border bg-muted/5 p-4">
              <div className="relative h-28 w-full max-w-md border rounded bg-white p-2">
                <Image
                  src={uploadedImage}
                  alt="Uploaded Signature"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled}
                onClick={() => {
                  setUploadedImage(null)
                  setValue("signatureBase64", null)
                  setValue("signatureSigned", false, { shouldValidate: true })
                }}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
              >
                <TrashIcon className="size-4 mr-2" />
                Remove Image
              </Button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-muted rounded-lg bg-white dark:bg-zinc-900 cursor-pointer hover:bg-muted/10 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                <Upload className="size-8 text-muted-foreground mb-2" />
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Click to upload signature photo
                </p>
                <p className="text-[10px] text-muted-foreground mt-1 leading-normal">
                  PNG, JPG, or JPEG (Max 5MB)
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={disabled}
              />
            </label>
          )}
        </div>
      )}
    </div>
  )
}
