import Link from "next/link"

import { MonthlyChart } from "@/components/monthly-chart"
import { MonthlySummary } from "@/components/monthly-summary"
import { TransactionList } from "@/components/transaction-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatMonthYear } from "@/lib/finance"
import { requireServerSession } from "@/lib/session"
import {
  getRecentTransactions,
  getSixMonthChartData,
  getSummaryForMonth,
} from "@/lib/transactions"

export default async function DashboardPage() {
  const session = await requireServerSession()
  const now = new Date()
  const month = now.getUTCMonth() + 1
  const year = now.getUTCFullYear()

  const [summary, recentTransactions, monthlyChart] = await Promise.all([
    getSummaryForMonth(session.user.id, month, year),
    getRecentTransactions(session.user.id, 6),
    getSixMonthChartData(session.user.id, now),
  ])

  return (
    <div className="flex flex-col gap-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            {session.user.name ? `Halo, ${session.user.name}` : "Ringkasan Bulan Ini"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {formatMonthYear(month, year)}
          </p>
          <Button asChild variant="outline">
            <Link href="/transactions#new-transaction">Tambah Transaksi</Link>
          </Button>
        </CardContent>
      </Card>

      <MonthlySummary
        balance={summary.balance}
        totalExpense={summary.totalExpense}
        totalIncome={summary.totalIncome}
      />

      <MonthlyChart data={monthlyChart} />

      <TransactionList
        title="Transaksi Terakhir"
        transactions={recentTransactions}
      />
    </div>
  )
}
