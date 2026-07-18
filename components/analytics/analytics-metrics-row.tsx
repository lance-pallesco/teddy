import {
  PawPrintIcon,
  HeartHandshakeIcon,
  PercentIcon,
  ClipboardListIcon,
  TimerIcon,
  FlameIcon,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import type { AnalyticsData } from "@/lib/services/analytics.service"

interface AnalyticsMetricsRowProps {
  metrics: AnalyticsData
}

export function AnalyticsMetricsRow({ metrics }: AnalyticsMetricsRowProps) {
  const adoptionRate = metrics.totalPets
    ? ((metrics.adoptedPets / metrics.totalPets) * 100).toFixed(1)
    : "0.0"

  const items = [
    {
      label: "Total Listings",
      value: metrics.totalPets,
      color: "text-zinc-900 dark:text-white",
      icon: PawPrintIcon,
      bgColor: "bg-zinc-500/10 text-zinc-600",
    },
    {
      label: "Active Listings",
      value: metrics.activePets,
      color: "text-blue-600 dark:text-blue-400",
      icon: FlameIcon,
      bgColor: "bg-blue-500/10 text-blue-600",
    },
    {
      label: "Adoptions Completed",
      value: metrics.adoptedPets,
      color: "text-emerald-600 dark:text-emerald-400",
      icon: HeartHandshakeIcon,
      bgColor: "bg-emerald-500/10 text-emerald-600",
    },
    {
      label: "Adoption Rate",
      value: `${adoptionRate}%`,
      color: "text-purple-600 dark:text-purple-400",
      icon: PercentIcon,
      bgColor: "bg-purple-500/10 text-purple-600",
    },
    {
      label: "Total Applications",
      value: metrics.totalApplications,
      color: "text-amber-600 dark:text-amber-400",
      icon: ClipboardListIcon,
      bgColor: "bg-amber-500/10 text-amber-600",
    },
    {
      label: "Avg. Days to Adopt",
      value: metrics.avgDaysToAdopt,
      color: "text-rose-600 dark:text-rose-400",
      icon: TimerIcon,
      bgColor: "bg-rose-500/10 text-rose-600",
      sub: "days",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {items.map((m, i) => {
        const Icon = m.icon
        return (
          <Card key={i} className="bg-white dark:bg-[#1E1A16] border-primary/10 shadow-xs overflow-hidden">
            <CardContent className="flex items-start justify-between p-4 relative">
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-none">
                  {m.label}
                </p>
                <div className="flex items-baseline gap-1 pt-1">
                  <span className={`text-2xl font-extrabold tracking-tight ${m.color}`}>
                    {m.value}
                  </span>
                  {m.sub && (
                    <span className="text-[10px] text-muted-foreground font-semibold">
                      {m.sub}
                    </span>
                  )}
                </div>
              </div>
              <div className={`p-1.5 rounded-lg shrink-0 ${m.bgColor}`}>
                <Icon className="size-4" />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
