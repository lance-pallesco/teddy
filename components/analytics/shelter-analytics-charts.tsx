"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { ShelterAnalyticsData } from "@/lib/services/analytics.service"

interface ShelterAnalyticsChartsProps {
  data: ShelterAnalyticsData
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

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#64748b"]

export function ShelterAnalyticsCharts({ data }: ShelterAnalyticsChartsProps) {
  const hasApplications = data.totalApplications > 0
  const hasPets = data.totalPets > 0

  return (
    <div className="grid gap-6 md:grid-cols-2 pt-4">
      {/* Weekly Applications Growth */}
      <Card className="border border-primary/10 shadow-xs bg-white dark:bg-[#1E1A16]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-[#3D3C3A] dark:text-white uppercase tracking-wider">
            Shelter Application Activity
          </CardTitle>
          <CardDescription className="text-xs">
            Incoming adoption applications over the past 8 weeks.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[240px] pt-4">
          {hasApplications ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data.weeklyApplications}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorShelterApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#AE8F65" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#AE8F65" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 9, fill: "#888" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 9, fill: "#888" }}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="Applications"
                  stroke="#AE8F65"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorShelterApps)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
              No application activity recorded yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pet Status Distribution */}
      <Card className="border border-primary/10 shadow-xs bg-white dark:bg-[#1E1A16]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-[#3D3C3A] dark:text-white uppercase tracking-wider">
            Pet Listing Status Ratios
          </CardTitle>
          <CardDescription className="text-xs">
            Current availability ratio of your listed foster pets.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[240px] pt-4 flex flex-col justify-between">
          {hasPets ? (
            <div className="size-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {data.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: "10px", fontWeight: "600" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
              No active listings to group
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
