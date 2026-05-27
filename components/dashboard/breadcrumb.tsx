"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

function formatSegment(segment: string) {
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

const uuidV4Pattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isUuidSegment(segment: string) {
  return uuidV4Pattern.test(segment)
}

export function DashboardBreadcrumb() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)
  const [resolvedLabels, setResolvedLabels] = useState<Record<string, string>>({})

  const breadcrumbSegments = useMemo(
    () =>
      segments.map((segment, index) => ({
        segment,
        href: `/${segments.slice(0, index + 1).join("/")}`,
      })),
    [segments]
  )

  useEffect(() => {
    let isCancelled = false

    async function resolveShelterLabels() {
      if (segments[0] !== "shelters") {
        return
      }

      const shelterId = segments[1]

      if (!shelterId || !isUuidSegment(shelterId)) {
        return
      }

      if (resolvedLabels[shelterId]) {
        return
      }

      try {
        const response = await fetch(`/api/dashboard/shelters/${shelterId}/label`, {
          method: "GET",
          cache: "no-store",
        })

        if (!response.ok) {
          return
        }

        const data = (await response.json()) as { label?: string }

        if (!data.label || isCancelled) {
          return
        }

        setResolvedLabels((previous) => ({
          ...previous,
          [shelterId]: data.label as string,
        }))
      } catch {
        // No-op: fallback to formatted segment when label lookup fails.
      }
    }

    void resolveShelterLabels()

    return () => {
      isCancelled = true
    }
  }, [pathname, resolvedLabels, segments])

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
            const label = resolvedLabels[segment] ?? formatSegment(segment)

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
