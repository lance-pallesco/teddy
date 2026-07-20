"use client"

import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"
import { AlertTriangleIcon, InfoIcon, ShieldAlertIcon, CheckCircle2Icon } from "lucide-react"
import { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type ConfirmationDialogProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: ReactNode
  confirmText?: string
  cancelText?: string
  variant?: "destructive" | "warning" | "info" | "success"
  isLoading?: boolean
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "destructive",
  isLoading = false,
}: ConfirmationDialogProps) {
  
  // Icon selector based on variant
  const getIcon = () => {
    switch (variant) {
      case "destructive":
        return <AlertTriangleIcon className="size-6 text-red-600" />
      case "warning":
        return <ShieldAlertIcon className="size-6 text-amber-600" />
      case "success":
        return <CheckCircle2Icon className="size-6 text-emerald-600" />
      case "info":
      default:
        return <InfoIcon className="size-6 text-blue-600" />
    }
  }

  // Circular background color for the icon
  const getIconBg = () => {
    switch (variant) {
      case "destructive":
        return "bg-red-50 dark:bg-red-950/20"
      case "warning":
        return "bg-amber-50 dark:bg-amber-950/20"
      case "success":
        return "bg-emerald-50 dark:bg-emerald-950/20"
      case "info":
      default:
        return "bg-blue-50 dark:bg-blue-950/20"
    }
  }

  // Button background colors
  const getConfirmButtonClasses = () => {
    switch (variant) {
      case "destructive":
        return "bg-red-600 text-white border-transparent hover:bg-red-700 font-semibold shadow-none cursor-pointer"
      case "warning":
        return "bg-amber-600 text-white border-transparent hover:bg-amber-700 font-semibold shadow-none cursor-pointer"
      case "success":
        return "bg-emerald-600 text-white border-transparent hover:bg-emerald-700 font-semibold shadow-none cursor-pointer"
      case "info":
      default:
        return "bg-[#AE8F65] text-white border-transparent hover:bg-[#9A7D58] font-semibold shadow-none cursor-pointer"
    }
  }

  return (
    <AlertDialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogPrimitive.Portal>
        {/* Overlay */}
        <AlertDialogPrimitive.Overlay 
          className="fixed inset-0 z-50 bg-gray-500/75 backdrop-blur-xs transition-opacity duration-200 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
        />
        
        {/* Content Box */}
        <AlertDialogPrimitive.Content 
          className="fixed top-[50%] left-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-xl border bg-white text-gray-900 shadow-xl outline-none duration-200 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]"
        >
          {/* Main Card Area */}
          <div className="bg-white px-6 pb-6 pt-5 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start gap-4">
              {/* Icon Circle */}
              <div className={cn(
                "mx-auto flex size-12 shrink-0 items-center justify-center rounded-full sm:mx-0 sm:size-10",
                getIconBg()
              )}>
                {getIcon()}
              </div>

              {/* Title & Description */}
              <div className="mt-3 text-center sm:ml-0 sm:mt-0 sm:text-left min-w-0 flex-1 pt-1">
                <AlertDialogPrimitive.Title className="text-base font-semibold leading-6 text-gray-900">
                  {title}
                </AlertDialogPrimitive.Title>
                <AlertDialogPrimitive.Description className="mt-2 text-sm text-gray-500 leading-normal ">
                  {description}
                </AlertDialogPrimitive.Description>
              </div>
            </div>
          </div>

          {/* Footer Bar with light grey background */}
          <div className="bg-gray-50 border-t px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-2">
            <AlertDialogPrimitive.Action asChild>
              <Button
                type="button"
                disabled={isLoading}
                onClick={(e) => {
                  e.preventDefault()
                  onConfirm()
                }}
                className={cn("w-full sm:w-auto h-9 text-sm px-4", getConfirmButtonClasses())}
              >
                {isLoading ? "Please wait..." : confirmText}
              </Button>
            </AlertDialogPrimitive.Action>
            
            <AlertDialogPrimitive.Cancel asChild>
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={onClose}
                className="mt-3 w-full sm:mt-0 sm:w-auto h-9 text-sm px-4 rounded-lg cursor-pointer bg-white text-gray-900 border-gray-300 hover:bg-gray-50 hover:text-gray-900 shadow-none font-semibold"
              >
                {cancelText}
              </Button>
            </AlertDialogPrimitive.Cancel>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  )
}
