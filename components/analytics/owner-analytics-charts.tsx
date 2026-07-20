"use client"

import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { PetOwnerAnalyticsData } from "@/lib/services/analytics.service"

interface OwnerAnalyticsChartsProps {
  data: PetOwnerAnalyticsData
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg shadow-lg text-xs text-zinc-900 dark:text-zinc-100">
        <p className="font-semibold mb-1 text-zinc-500">{label || payload[0].name}</p>
        {payload.map((p: any, idx: number) => (
          <div key={idx} className="flex items-center gap-2 mt-0.5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: p.color || p.payload.fill || p.stroke }}
            />
            <span className="text-zinc-600 dark:text-zinc-400 font-medium">
              {p.name === "value" ? "Total" : p.name}:
            </span>
            <span className="font-bold">{p.value}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export function OwnerAnalyticsCharts({ data }: OwnerAnalyticsChartsProps) {
  const hasApplications = data.totalApplications > 0

  return (
    <Card className="border border-primary/10 shadow-xs bg-white dark:bg-[#1E1A16] mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold text-[#3D3C3A] dark:text-white uppercase tracking-wider">
          Adoption Conversion Funnel
        </CardTitle>
        <CardDescription className="text-xs">
          Success pipeline tracking conversion ratios of applications for your posted fosters.
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[220px] pt-4">
        {hasApplications ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={data.pipelineData}
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: "#555", fontWeight: "500" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                {data.pipelineData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
            No active applications logged for your fostering listings yet
          </div>
        )}
      </CardContent>
    </Card>
  )
}
