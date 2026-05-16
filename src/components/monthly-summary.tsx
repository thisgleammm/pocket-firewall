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
      <Card className="bg-primary text-primary-foreground md:col-span-3">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium opacity-80">
            <Wallet className="h-4 w-4" />
            Total Saldo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{formatCurrency(balance)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <ArrowUpCircle className="h-4 w-4 text-emerald-600" />
            Pemasukan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-semibold text-emerald-600">
            {formatCurrency(totalIncome)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <ArrowDownCircle className="h-4 w-4 text-rose-600" />
            Pengeluaran
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-semibold text-rose-600">
            {formatCurrency(totalExpense)}
          </div>
        </CardContent>
      </Card>

      <Card>
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
