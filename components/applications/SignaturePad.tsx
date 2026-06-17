"use client"

import { useEffect, useRef, useState } from "react"
import SignatureCanvas from "react-signature-canvas"
import { useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { TrashIcon, CheckIcon } from "lucide-react"
import Image from "next/image"

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

  const handleChangeSignature = () => {
    setIsSaved(false)
    setValue("signatureBase64", null)
    setValue("signatureSigned", false, { shouldValidate: true })
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
  )
}
