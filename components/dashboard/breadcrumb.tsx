"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMemo, } from "react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useBreadcrumbs } from "./breadcrumb-context"

function formatSegment(segment: string) {
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export function DashboardBreadcrumb() {
  const pathname = usePathname()
  const { labels } = useBreadcrumbs()
  const segments = pathname.split("/").filter(Boolean)

  const breadcrumbSegments = useMemo(() => 
    segments.map((segment, index) => ({
      segment,
      href: `/${segments.slice(0, index + 1).join("/")}`,
    })
  ), [segments])

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/dashboard">Dashboard</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {segments[0] !== "dashboard" &&
          breadcrumbSegments.map(({ segment, href }, index) => {
            const isLast = index === breadcrumbSegments.length - 1

            const label = labels[segment] ?? formatSegment(segment)

            return (
              <div className="contents" key={href}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={href}>{label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </div>
            )
          })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
