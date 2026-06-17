"use client"

import { cn } from "@/lib/utils"

interface WizardStepWrapperProps {
  children: React.ReactNode
  className?: string
}

export function WizardStepWrapper({ children, className }: WizardStepWrapperProps) {
  return (
    <div
      className={cn(
        "w-full animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out fill-mode-both",
        className
      )}
    >
      {children}
    </div>
  )
}
