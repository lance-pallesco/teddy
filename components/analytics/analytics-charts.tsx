"use client"

import { useMemo } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { AnalyticsData } from "@/lib/services/analytics.service"

interface AnalyticsChartsProps {
  data: AnalyticsData
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
            <span className="font-bold">
              {p.value}
              {p.unit || ""}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#0ea5e9", "#64748b"]

export function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  // Safe checks for empty data sets
  const hasApplications = data.totalApplications > 0
  const hasPets = data.totalPets > 0

  return (
    <div className="space-y-6">
      {/* Top Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Applications Growth Card */}
        <Card className="border-primary/10 shadow-xs bg-white dark:bg-[#1E1A16]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-[#3D3C3A] dark:text-white">
              Weekly Application Growth
            </CardTitle>
            <CardDescription className="text-xs">
              Adoption requests submitted over the past 8 weeks.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80 pt-4">
            {hasApplications ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data.weeklyApplications}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
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
                    fill="url(#colorApps)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                No application data logged yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Conversion Funnel Card */}
        <Card className="border-primary/10 shadow-xs bg-white dark:bg-[#1E1A16]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-[#3D3C3A] dark:text-white">
              Conversion Pipeline
            </CardTitle>
            <CardDescription className="text-xs">
              Application progression conversion percentage rate.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80 pt-4">
            {hasApplications ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={data.pipelineData}
                  margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
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
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={18}>
                    {data.pipelineData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                No submitted applications logged yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Listed Pets by Species (PieChart) */}
        <Card className="border-primary/10 shadow-xs bg-white dark:bg-[#1E1A16]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-[#3D3C3A] dark:text-white">
              Listed Pets by Species
            </CardTitle>
            <CardDescription className="text-xs">
              Breakdown of total registered pets by classification.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80 pt-4 flex flex-col justify-between">
            {hasPets ? (
              <div className="size-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.speciesData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {data.speciesData.map((entry, index) => (
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
                No registered pet profiles found
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Performing Shelters (BarChart) */}
        <Card className="border-primary/10 shadow-xs bg-white dark:bg-[#1E1A16]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-[#3D3C3A] dark:text-white">
              Top Performing Shelters
            </CardTitle>
            <CardDescription className="text-xs">
              Registered shelters with the highest counts of finalized adoptions.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80 pt-4">
            {data.shelterData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.shelterData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                >
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
                  <Bar dataKey="Adoptions" fill="#AE8F65" radius={[4, 4, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                No finalized adoptions completed yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
