export const TRANSACTION_TYPES = ["INCOME", "EXPENSE"] as const

export type TransactionTypeValue = (typeof TRANSACTION_TYPES)[number]

export interface MonthYearPeriod {
  month: number
  year: number
}

export const DEFAULT_CATEGORY_NAMES: Record<TransactionTypeValue, string[]> = {
  EXPENSE: ["Makan", "Transport", "Kesehatan", "Belanja", "Hiburan", "Tagihan", "Lainnya"],
  INCOME: ["Gaji", "Freelance", "Investasi", "Lainnya"],
}

type SummaryInput = {
  amount: number | string
  categoryName: string
  type: TransactionTypeValue
}

type ChartRowInput = {
  month: number
  total: number | string
  type: TransactionTypeValue
  year: number
}

export function isTransactionType(value: unknown): value is TransactionTypeValue {
  return typeof value === "string" && TRANSACTION_TYPES.includes(value as TransactionTypeValue)
}

export function parseAmountInput(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? value : null
  }

  if (typeof value !== "string") {
    return null
  }

  const normalized = value.replace(/,/g, "").trim()

  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    return null
  }

  const parsed = Number(normalized)

  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

export function normalizeMonthYear(
  monthValue: string | null,
  yearValue: string | null,
  fallbackDate = new Date()
): MonthYearPeriod | null {
  if (!monthValue || !yearValue) {
    return {
      month: fallbackDate.getUTCMonth() + 1,
      year: fallbackDate.getUTCFullYear(),
    }
  }

  const month = Number(monthValue)
  const year = Number(yearValue)

  if (!Number.isInteger(month) || month < 1 || month > 12) {
    return null
  }

  if (!Number.isInteger(year) || year < 2000 || year > 9999) {
    return null
  }

  return { month, year }
}

export function compareMonthYear(
  left: MonthYearPeriod,
  right: MonthYearPeriod
) {
  if (left.year !== right.year) {
    return left.year < right.year ? -1 : 1
  }

  if (left.month === right.month) {
    return 0
  }

  return left.month < right.month ? -1 : 1
}

export function clampMonthYearToMax(
  period: MonthYearPeriod,
  maxPeriod: MonthYearPeriod
) {
  return compareMonthYear(period, maxPeriod) > 0 ? maxPeriod : period
}

export function shiftMonthYear(period: MonthYearPeriod, offset: number) {
  const shifted = new Date(
    Date.UTC(period.year, period.month - 1 + offset, 1)
  )

  return {
    month: shifted.getUTCMonth() + 1,
    year: shifted.getUTCFullYear(),
  }
}

export function getMonthRange(month: number, year: number) {
  return {
    start: new Date(Date.UTC(year, month - 1, 1)),
    end: new Date(Date.UTC(year, month, 1)),
  }
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    currency: "IDR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(amount)
}

export function formatShortDate(value: Date | string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
  }).format(new Date(value))
}

export function formatMonthYear(month: number, year: number) {
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, 1)))
}

export function calculateSummary(items: SummaryInput[]) {
  const summary = {
    balance: 0,
    byCategory: [] as Array<{
      categoryName: string
      total: number
      type: TransactionTypeValue
    }>,
    totalExpense: 0,
    totalIncome: 0,
  }

  const byCategoryMap = new Map<string, { categoryName: string; total: number; type: TransactionTypeValue }>()

  for (const item of items) {
    const amount = typeof item.amount === "number" ? item.amount : Number(item.amount)

    if (!Number.isFinite(amount)) {
      continue
    }

    if (item.type === "INCOME") {
      summary.totalIncome += amount
    } else {
      summary.totalExpense += amount
    }

    const key = `${item.type}:${item.categoryName}`
    const existing = byCategoryMap.get(key)

    if (existing) {
      existing.total += amount
    } else {
      byCategoryMap.set(key, {
        categoryName: item.categoryName,
        total: amount,
        type: item.type,
      })
    }
  }

  summary.balance = summary.totalIncome - summary.totalExpense
  summary.byCategory = Array.from(byCategoryMap.values()).sort((left, right) => {
    if (left.type !== right.type) {
      return left.type === "EXPENSE" ? -1 : 1
    }

    return right.total - left.total
  })

  return summary
}

function monthKey(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`
}

function monthLabel(year: number, month: number) {
  return new Intl.DateTimeFormat("id-ID", {
    month: "short",
  }).format(new Date(Date.UTC(year, month - 1, 1)))
}

export function buildSixMonthChartSeries(rows: ChartRowInput[], anchorDate = new Date()) {
  const totals = new Map<string, { expense: number; income: number }>()

  for (const row of rows) {
    const key = monthKey(row.year, row.month)
    const existing = totals.get(key) ?? { expense: 0, income: 0 }
    const amount = typeof row.total === "number" ? row.total : Number(row.total)

    if (!Number.isFinite(amount)) {
      continue
    }

    if (row.type === "INCOME") {
      existing.income += amount
    } else {
      existing.expense += amount
    }

    totals.set(key, existing)
  }

  return Array.from({ length: 6 }, (_, index) => {
    const current = new Date(Date.UTC(anchorDate.getUTCFullYear(), anchorDate.getUTCMonth() - (5 - index), 1))
    const year = current.getUTCFullYear()
    const month = current.getUTCMonth() + 1
    const key = monthKey(year, month)
    const total = totals.get(key) ?? { expense: 0, income: 0 }

    return {
      expense: total.expense,
      income: total.income,
      key,
      label: monthLabel(year, month),
    }
  })
}
