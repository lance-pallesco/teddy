import Link from "next/link"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"

type PageHeaderProps = {
  title: string
  subtitle?: string
  action?: {
    label: string
    href: string
    icon?: ReactNode
  }
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {action ? (
        <Button asChild size="lg" className="shrink-0 bg-[#987554] text-white border-transparent hover:bg-[#9A7D58] hover:text-white cursor-pointer rounded-lg transition-colors duration-200 font-medium shadow-none">
          <Link href={action.href}>
            {action.icon}
            {action.label}
          </Link>
        </Button>
      ) : null}
    </div>
  )
}
