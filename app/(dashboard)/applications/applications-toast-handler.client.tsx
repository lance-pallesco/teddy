"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"

export function ApplicationsToastHandler() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const error = searchParams.get("error")
    const name = searchParams.get("name")

    if (error === "duplicate") {
      toast.error(`You have already submitted an application for ${name || "this pet"}.`)
      
      // Clean up the URL query parameters
      const cleanUrl = window.location.pathname
      window.history.replaceState({}, "", cleanUrl)
    }
  }, [searchParams])

  return null
}
