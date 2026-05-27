import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground border-transparent",
        secondary:
          "bg-secondary text-secondary-foreground border-transparent",
        outline: "text-foreground", // keep border via wrapper below
        success:
          "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400",
        warning:
          "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400",
        danger:
          "bg-destructive/10 text-destructive border-destructive/20 dark:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export type BadgeProps = React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants>

export function Badge({
  className,
  variant,
  ...props
}: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(
        badgeVariants({ variant }),
        variant === "outline" ? "bg-transparent border-input" : "",
        className
      )}
      {...props}
    />
  )
}

