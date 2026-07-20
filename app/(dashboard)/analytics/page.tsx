import { requireRole } from "@/lib/auth/require-role"
import { getAnalyticsData } from "@/lib/services/analytics.service"
import { AnalyticsMetricsRow } from "@/components/analytics/analytics-metrics-row"
import { AnalyticsCharts } from "@/components/analytics/analytics-charts"

export default async function AnalyticsPage() {
  // 1. Enforce ADMIN credentials check
  await requireRole(["ADMIN"])

  // 2. Fetch full platform analytics data
  const data = await getAnalyticsData()

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:px-16 md:py-6 w-full max-w-full min-w-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#3D3C3A] dark:text-white">
            Analytics Insights
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Visual breakdown of shelter performance, active listings, and adoption pipelines.
          </p>
        </div>
      </div>

      {/* Metric summary boxes row */}
      <AnalyticsMetricsRow metrics={data} />

      {/* Recharts visualizations */}
      <AnalyticsCharts data={data} />
    </div>
  )
}
