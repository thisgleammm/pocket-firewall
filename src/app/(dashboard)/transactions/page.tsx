import { MonthlySummary } from "@/components/monthly-summary"
import { TransactionForm } from "@/components/transaction-form"
import { TransactionList } from "@/components/transaction-list"
import { formatMonthYear } from "@/lib/finance"
import { listCategoriesForUser } from "@/lib/categories"
import { requireServerSession } from "@/lib/session"
import { getSummaryForMonth, getTransactionsForMonth } from "@/lib/transactions"

export default async function TransactionsPage() {
  const session = await requireServerSession()
  const now = new Date()
  const month = now.getUTCMonth() + 1
  const year = now.getUTCFullYear()
  const defaultDate = now.toISOString().slice(0, 10)

  const [categories, transactions, summary] = await Promise.all([
    listCategoriesForUser(session.user.id),
    getTransactionsForMonth(session.user.id, month, year),
    getSummaryForMonth(session.user.id, month, year),
  ])

  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <h2 className="text-2xl font-semibold">Transaksi</h2>
        <p className="text-sm text-muted-foreground">
          {formatMonthYear(month, year)}
        </p>
      </div>

      <MonthlySummary
        balance={summary.balance}
        totalExpense={summary.totalExpense}
        totalIncome={summary.totalIncome}
      />

      <TransactionForm categories={categories} defaultDate={defaultDate} />

      <TransactionList
        title="Riwayat Bulan Ini"
        transactions={transactions}
      />
    </div>
  )
}
