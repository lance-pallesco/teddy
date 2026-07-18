import * as React from "react"

import { cn } from "@/lib/utils"

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div data-slot="table" className="w-full overflow-auto">
      <table
        className={cn("w-full caption-bottom text-md font-light", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({
  className,
  ...props
}: React.ComponentProps<"thead">) {
  return (
    <thead
      className={cn("bg-muted/50 text-muted-foreground", className)}
      {...props}
    />
  )
}

function TableBody({
  className,
  ...props
}: React.ComponentProps<"tbody">) {
  return <tbody className={cn(className)} {...props} />
}

function TableFooter({
  className,
  ...props
}: React.ComponentProps<"tfoot">) {
  return <tfoot className={cn(className)} {...props} />
}

function TableRow({
  className,
  ...props
}: React.ComponentProps<"tr">) {
  return (
    <tr
      className={cn(
        "border-t border-border/50 transition-colors hover:bg-muted/30",
        className
      )}
      {...props}
    />
  )
}

function TableHead({
  className,
  ...props
}: React.ComponentProps<"th">) {
  return (
    <th
      scope="col"
      className={cn("px-4 py-3 text-left text-lg font-light", className)}
      {...props}
    />
  )
}

function TableCell({
  className,
  ...props
}: React.ComponentProps<"td">) {
  return (
    <td className={cn("px-4 py-3 align-middle", className)} {...props} />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}

