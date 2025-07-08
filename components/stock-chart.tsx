"use client"

import { ResponsiveContainer, Tooltip, XAxis, YAxis, Area, AreaChart } from "recharts"
import { useTheme } from "next-themes"

interface StockChartProps {
  data: Array<{ date: string; price: number }>
}

export default function StockChart({ data }: StockChartProps) {
  const { theme } = useTheme()

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("th-TH", {
      year: "2-digit",
      month: "short",
    })
  }

  const formatTooltipDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const isDark = theme === "dark"

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 12, fill: isDark ? "#94a3b8" : "#64748b" }}
            axisLine={{ stroke: isDark ? "#475569" : "#cbd5e1" }}
            tickLine={{ stroke: isDark ? "#475569" : "#cbd5e1" }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: isDark ? "#94a3b8" : "#64748b" }}
            tickFormatter={(value) => `$${value.toFixed(0)}`}
            axisLine={{ stroke: isDark ? "#475569" : "#cbd5e1" }}
            tickLine={{ stroke: isDark ? "#475569" : "#cbd5e1" }}
          />
          <Tooltip
            labelFormatter={(value) => formatTooltipDate(value as string)}
            formatter={(value: number) => [`$${value.toFixed(2)}`, "ราคา"]}
            contentStyle={{
              backgroundColor: isDark ? "#1e293b" : "white",
              border: `1px solid ${isDark ? "#475569" : "#e2e8f0"}`,
              borderRadius: "8px",
              color: isDark ? "#f1f5f9" : "#0f172a",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            }}
          />
          <Area type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={3} fill="url(#colorPrice)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
