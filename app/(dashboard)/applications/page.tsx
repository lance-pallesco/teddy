import { PlaceholderPage } from "@/components/dashboard/placeholder-page"
import { ApplicationsToastHandler } from "./applications-toast-handler.client"
import { Suspense } from "react"

export default function ApplicationsPage() {
  return (
    <>
      <Suspense fallback={null}>
        <ApplicationsToastHandler />
      </Suspense>
      <PlaceholderPage title="All Applications" />
    </>
  )
}
