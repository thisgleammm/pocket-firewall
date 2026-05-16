import { ArrowDownCircle, ArrowUpCircle, Wallet } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/finance"

interface MonthlySummaryProps {
  balance: number
  totalExpense: number
  totalIncome: number
}

export function MonthlySummary({
  balance,
  totalExpense,
  totalIncome,
}: MonthlySummaryProps) {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card className="border-0 bg-foreground text-background shadow-[0_24px_56px_rgba(17,17,17,0.16)] md:col-span-3">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-background/72">
            <Wallet className="h-4 w-4" />
            Total Saldo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{formatCurrency(balance)}</div>
        </CardContent>
      </Card>

      <Card className="bg-card/96">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <span
              className="inline-flex h-8 w-8 items-center justify-center rounded-[0.9rem]"
              style={{
                backgroundColor: "color-mix(in oklab, var(--chart-2) 14%, transparent)",
                color: "var(--chart-2)",
              }}
            >
              <ArrowUpCircle className="h-4 w-4" />
            </span>
            Pemasukan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-semibold text-[color:var(--chart-2)]">
            {formatCurrency(totalIncome)}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/96">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <span
              className="inline-flex h-8 w-8 items-center justify-center rounded-[0.9rem]"
              style={{
                backgroundColor: "color-mix(in oklab, var(--chart-5) 14%, transparent)",
                color: "var(--chart-5)",
              }}
            >
              <ArrowDownCircle className="h-4 w-4" />
            </span>
            Pengeluaran
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-semibold text-[color:var(--chart-5)]">
            {formatCurrency(totalExpense)}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-accent/45">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Selisih Bulan Ini</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-semibold">{formatCurrency(balance)}</div>
        </CardContent>
      </Card>
    </section>
  )
}
