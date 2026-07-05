"use client"

import { useId, useRef, useState, useEffect } from "react"
import { useFormContext } from "react-hook-form"
import {
  Field,
  FieldError,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  uploadApplicationDocumentAction,
  deleteDocumentAction,
} from "@/app/(dashboard)/applications/actions/application.action"
import { GovernmentIDType, ApplicationDocumentType } from "@prisma/client"
import { GOVERNMENT_ID_TYPE_LABELS } from "@/lib/constants/application.constants"
import { UploadIcon, Loader2Icon, FileTextIcon, TrashIcon, CheckIcon } from "lucide-react"
import { toast } from "sonner"

// Matching schema shape
type UploadedDoc = {
  id: string
  type: ApplicationDocumentType
  idType: GovernmentIDType
  name: string
  url: string
}

interface Step6DocumentsProps {
  applicationId: string
  documents: UploadedDoc[]
  onDocumentAdded: (doc: UploadedDoc) => void
  onDocumentRemoved: (id: string) => void
  disabled?: boolean
}

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["Bytes", "KB", "MB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
}

export function Step6Documents({
  applicationId,
  documents,
  onDocumentAdded,
  onDocumentRemoved,
  disabled = false,
}: Step6DocumentsProps) {
  const { setValue, formState: { errors } } = useFormContext()
  
  const idInputId = useId()
  const addressInputId = useId()
  const idFileRef = useRef<HTMLInputElement>(null)
  const addressFileRef = useRef<HTMLInputElement>(null)

  const [idType, setIdType] = useState<GovernmentIDType>("DRIVER_LICENSE")
  const [isUploadingId, setIsUploadingId] = useState(false)
  const [isUploadingAddress, setIsUploadingAddress] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const govIdDoc = documents.find((d) => d.type === "GOVERNMENT_ID")
  const addressDoc = documents.find((d) => d.type === "PROOF_OF_ADDRESS")

  // Sync with form validation state
  useEffect(() => {
    setValue("governmentIdUploaded", !!govIdDoc, { shouldValidate: true })
    setValue("proofOfAddressUploaded", !!addressDoc, { shouldValidate: true })
  }, [govIdDoc, addressDoc, setValue])

  const handleFileUpload = async (
    file: File,
    type: ApplicationDocumentType,
    gType?: GovernmentIDType
  ) => {
    // Validate client-side
    const allowed = ["image/jpeg", "image/png", "application/pdf"]
    if (!allowed.includes(file.type)) {
      toast.error("Only JPG, PNG, and PDF files are accepted.")
      return
    }

    const maxBytes = 5 * 1024 * 1024
    if (file.size > maxBytes) {
      toast.error("File size cannot exceed 5MB.")
      return
    }

    if (type === "GOVERNMENT_ID") {
      setIsUploadingId(true)
    } else {
      setIsUploadingAddress(true)
    }

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("applicationId", applicationId)
      formData.append("type", type)
      if (gType) {
        formData.append("idType", gType)
      }

      const res = await uploadApplicationDocumentAction(formData)
      if (res.success && res.document) {
        onDocumentAdded(res.document as UploadedDoc)
        toast.success(`${type === "GOVERNMENT_ID" ? "ID" : "Proof of address"} uploaded!`)
      } else {
        toast.error(res.error ?? "Upload failed.")
      }
    } catch (err) {
      console.error(err)
      toast.error("An error occurred during file upload.")
    } finally {
      if (type === "GOVERNMENT_ID") {
        setIsUploadingId(false)
      } else {
        setIsUploadingAddress(false)
      }
    }
  }

  const handleDelete = async (docId: string) => {
    setDeletingId(docId)
    try {
      const res = await deleteDocumentAction(docId)
      if (res.success) {
        onDocumentRemoved(docId)
        toast.success("Document removed.")
      } else {
        toast.error(res.error ?? "Failed to delete document.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to delete document.")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Upload Supporting Documents</h3>
        <p className="text-sm text-muted-foreground">
          Adoption applications require verification of identity and home address.
        </p>
      </div>

      <div className="space-y-6 border-t pt-4">
        {/* Government Issued ID */}
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <h4 className="font-semibold text-sm">1. Government Issued ID</h4>
            <p className="text-xs text-muted-foreground">
              Please select the type of ID you are uploading, then attach the file.
            </p>
          </div>

          {!govIdDoc ? (
            <div className="grid gap-3 sm:grid-cols-3 items-end">
              <Field>
                <FieldLabel htmlFor="id-select">ID Type</FieldLabel>
                <Select
                  value={idType}
                  onValueChange={(val) => setIdType(val as GovernmentIDType)}
                  disabled={disabled || isUploadingId}
                >
                  <SelectTrigger id="id-select">
                    <SelectValue placeholder="Select ID Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(GovernmentIDType).map((type) => (
                      <SelectItem key={type} value={type}>
                        {GOVERNMENT_ID_TYPE_LABELS[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <div className="sm:col-span-2">
                <input
                  ref={idFileRef}
                  id={idInputId}
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  className="sr-only"
                  disabled={disabled || isUploadingId}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      void handleFileUpload(file, "GOVERNMENT_ID", idType)
                    }
                    e.target.value = ""
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={disabled || isUploadingId}
                  onClick={() => idFileRef.current?.click()}
                  className="w-full h-10 border-dashed"
                >
                  {isUploadingId ? (
                    <>
                      <Loader2Icon className="size-4 animate-spin mr-2" />
                      Uploading ID...
                    </>
                  ) : (
                    <>
                      <UploadIcon className="size-4 mr-2" />
                      Choose ID File
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-lg border bg-muted/20 p-3 text-sm">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileTextIcon className="size-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">{govIdDoc.name}</p>
                  <p className="text-xs text-muted-foreground uppercase">
                    {GOVERNMENT_ID_TYPE_LABELS[govIdDoc.idType]}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={disabled || deletingId === govIdDoc.id}
                onClick={() => handleDelete(govIdDoc.id)}
                className="text-destructive hover:bg-destructive/10"
              >
                {deletingId === govIdDoc.id ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  <TrashIcon className="size-4" />
                )}
              </Button>
            </div>
          )}
          <FieldError errors={[errors.governmentIdUploaded]} />
        </div>

        {/* Proof of Address */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex flex-col gap-1">
            <h4 className="font-semibold text-sm">2. Proof of Address</h4>
            <p className="text-xs text-muted-foreground">
              utility bill, lease agreement, or barangay certificate (issued in the last 3 months).
            </p>
          </div>

          {!addressDoc ? (
            <div>
              <input
                ref={addressFileRef}
                id={addressInputId}
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                className="sr-only"
                disabled={disabled || isUploadingAddress}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    void handleFileUpload(file, "PROOF_OF_ADDRESS")
                  }
                  e.target.value = ""
                }}
              />
              <Button
                type="button"
                variant="outline"
                disabled={disabled || isUploadingAddress}
                onClick={() => addressFileRef.current?.click()}
                className="w-full h-10 border-dashed"
              >
                {isUploadingAddress ? (
                  <>
                    <Loader2Icon className="size-4 animate-spin mr-2" />
                    Uploading Proof...
                  </>
                ) : (
                  <>
                    <UploadIcon className="size-4 mr-2" />
                    Choose Proof of Address
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-lg border bg-muted/20 p-3 text-sm">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileTextIcon className="size-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">{addressDoc.name}</p>
                  <p className="text-xs text-muted-foreground uppercase">Proof of Address</p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={disabled || deletingId === addressDoc.id}
                onClick={() => handleDelete(addressDoc.id)}
                className="text-destructive hover:bg-destructive/10"
              >
                {deletingId === addressDoc.id ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  <TrashIcon className="size-4" />
                )}
              </Button>
            </div>
          )}
          <FieldError errors={[errors.proofOfAddressUploaded]} />
        </div>
      </div>
    </div>
  )
}
