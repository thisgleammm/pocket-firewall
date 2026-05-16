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
              <CartesianGrid vertical={false} strokeDasharray="4 4" />
              <XAxis
                axisLine={false}
                dataKey="label"
                tickLine={false}
                tickMargin={8}
              />
              <YAxis
                axisLine={false}
                tickFormatter={(value: number) => `Rp${Math.round(value / 1000)}k`}
                tickLine={false}
                width={56}
              />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value ?? 0))}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.key ?? ""}
              />
              <Bar dataKey="income" fill="#16a34a" name="Pemasukan" radius={[8, 8, 0, 0]} />
              <Bar dataKey="expense" fill="#dc2626" name="Pengeluaran" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
