"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type TabsContextValue = {
  value: string
  setValue: (next: string) => void
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

export type TabsProps = {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

export function Tabs({
  value: controlledValue,
  defaultValue,
  onValueChange,
  children,
  className,
}: TabsProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(
    defaultValue ?? ""
  )

  const value = controlledValue ?? uncontrolledValue

  const setValue = React.useCallback(
    (next: string) => {
      if (controlledValue === undefined) {
        setUncontrolledValue(next)
      }
      onValueChange?.(next)
    },
    [controlledValue, onValueChange]
  )

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={cn(className)} data-slot="tabs">
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export function TabsList({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      data-slot="tabs-list"
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-muted/50 p-1 text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

export function TabsTrigger({
  value,
  className,
  ...props
}: React.ComponentProps<"button"> & { value: string }) {
  const ctx = React.useContext(TabsContext)
  if (!ctx) {
    throw new Error("TabsTrigger must be used within Tabs")
  }

  const isActive = ctx.value === value

  return (
    <button
      role="tab"
      type="button"
      aria-selected={isActive}
      data-slot="tabs-trigger"
      onClick={() => ctx.setValue(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
        className
      )}
      {...props}
    >
      {props.children}
    </button>
  )
}

export function TabsContent({
  value,
  className,
  ...props
}: React.ComponentProps<"div"> & { value: string }) {
  const ctx = React.useContext(TabsContext)
  if (!ctx) {
    throw new Error("TabsContent must be used within Tabs")
  }

  if (ctx.value !== value) {
    return null
  }

  return (
    <div
      role="tabpanel"
      data-slot="tabs-content"
      className={cn("mt-4", className)}
      {...props}
    />
  )
}

