import { formatMonthYear, formatShortDate, type TransactionTypeValue } from "./finance.ts"

export interface ReportSummaryRow {
  categoryName: string
  total: number
  type: TransactionTypeValue
}

export interface ReportTransactionRow {
  amount: number
  categoryName: string
  date: string
  note: string | null
  type: TransactionTypeValue
}

export interface ReportDocumentInput {
  month: number
  summary: {
    balance: number
    byCategory: ReportSummaryRow[]
    totalExpense: number
    totalIncome: number
  }
  transactions: ReportTransactionRow[]
  year: number
}

export function buildReportFileBase(month: number, year: number) {
  return `${year}-${String(month).padStart(2, "0")}`
}

export function buildReportBlobPath(userId: string, month: number, year: number) {
  return `reports/${userId}/${buildReportFileBase(month, year)}.pdf`
}

export function buildReportDocumentData(input: ReportDocumentInput) {
  const expenseByCategory = input.summary.byCategory
    .filter((item) => item.type === "EXPENSE")
    .sort((left, right) => right.total - left.total)
    .map((item) => ({
      categoryName: item.categoryName,
      percentage:
        input.summary.totalExpense > 0
          ? Math.round((item.total / input.summary.totalExpense) * 100)
          : 0,
      total: item.total,
    }))

  const transactions = [...input.transactions]
    .sort((left, right) => left.date.localeCompare(right.date))
    .map((transaction) => ({
      amount: transaction.amount,
      categoryName: transaction.categoryName,
      dateLabel: formatShortDate(transaction.date),
      note: transaction.note?.trim() ? transaction.note.trim() : "-",
      type: transaction.type,
    }))

  return {
    expenseByCategory,
    month: input.month,
    summary: {
      balance: input.summary.balance,
      totalExpense: input.summary.totalExpense,
      totalIncome: input.summary.totalIncome,
    },
    title: `PocketFirewall — Laporan Bulan ${formatMonthYear(input.month, input.year)}`,
    transactions,
    year: input.year,
  }
}
