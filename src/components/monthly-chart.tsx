"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/finance"

interface MonthlyChartProps {
  data: Array<{
    expense: number
    income: number
    key: string
    label: string
  }>
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>6 Bulan Terakhir</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={10}>
              <CartesianGrid
                vertical={false}
                stroke="var(--border)"
                strokeDasharray="4 4"
              />
              <XAxis
                axisLine={false}
                dataKey="label"
                tickLine={false}
                tickMargin={8}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickFormatter={(value: number) => `Rp${Math.round(value / 1000)}k`}
                tickLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                width={56}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "16px",
                  boxShadow: "0 18px 36px rgba(77,57,39,0.12)",
                }}
                formatter={(value) => formatCurrency(Number(value ?? 0))}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.key ?? ""}
              />
              <Bar
                dataKey="income"
                fill="var(--chart-2)"
                name="Pemasukan"
                radius={[8, 8, 0, 0]}
              />
              <Bar
                dataKey="expense"
                fill="var(--chart-5)"
                name="Pengeluaran"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
