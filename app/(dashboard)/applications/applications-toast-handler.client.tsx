"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"

let lastShownToastParam: string | null = null

export function ApplicationsToastHandler() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const error = searchParams.get("error")
    const name = searchParams.get("name")
    const key = `${error}-${name}`

    if (error === "rejected" && lastShownToastParam !== key) {
      lastShownToastParam = key
      toast.error(`Your application for ${name || "this pet"} was previously declined.`, {
        description: "Re-applying for a pet after a declined application is not allowed.",
      })
      
      const cleanUrl = window.location.pathname
      window.history.replaceState({}, "", cleanUrl)
    } else if (error === "duplicate" && lastShownToastParam !== key) {
      lastShownToastParam = key
      toast.info(`You already submitted an application for ${name || "this pet"}.`, {
        description: "You can view and track its status in your applications list.",
      })
      
      const cleanUrl = window.location.pathname
      window.history.replaceState({}, "", cleanUrl)
    }
  }, [searchParams])

  return null
}
