import { type Prisma, TransactionType } from "@prisma/client"

import { prisma } from "@/lib/db"
import { buildSixMonthChartSeries, calculateSummary, getMonthRange } from "@/lib/finance"

type TransactionWithCategory = Prisma.TransactionGetPayload<{
  include: {
    category: true
  }
}>

export function serializeTransaction(transaction: TransactionWithCategory) {
  return {
    amount: Number(transaction.amount),
    category: {
      id: transaction.category.id,
      isDefault: transaction.category.isDefault,
      name: transaction.category.name,
      type: transaction.category.type,
    },
    createdAt: transaction.createdAt.toISOString(),
    date: transaction.date.toISOString(),
    id: transaction.id,
    note: transaction.note,
    type: transaction.type,
  }
}

export async function getTransactionsForMonth(
  userId: string,
  month: number,
  year: number
) {
  const { end, start } = getMonthRange(month, year)

  const transactions = await prisma.transaction.findMany({
    include: {
      category: true,
    },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    where: {
      date: {
        gte: start,
        lt: end,
      },
      userId,
    },
  })

  return transactions.map(serializeTransaction)
}

export async function getRecentTransactions(userId: string, limit = 5) {
  const transactions = await prisma.transaction.findMany({
    include: {
      category: true,
    },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: limit,
    where: {
      userId,
    },
  })

  return transactions.map(serializeTransaction)
}

export async function getSummaryForMonth(
  userId: string,
  month: number,
  year: number
) {
  const { end, start } = getMonthRange(month, year)

  const rows = await prisma.transaction.findMany({
    select: {
      amount: true,
      category: {
        select: {
          name: true,
        },
      },
      type: true,
    },
    where: {
      date: {
        gte: start,
        lt: end,
      },
      userId,
    },
  })

  return calculateSummary(
    rows.map((row) => ({
      amount: Number(row.amount),
      categoryName: row.category.name,
      type: row.type,
    }))
  )
}

export async function getSixMonthChartData(userId: string, anchorDate = new Date()) {
  const start = new Date(
    Date.UTC(anchorDate.getUTCFullYear(), anchorDate.getUTCMonth() - 5, 1)
  )

  const rows = await prisma.transaction.findMany({
    orderBy: {
      date: "asc",
    },
    select: {
      amount: true,
      date: true,
      type: true,
    },
    where: {
      date: {
        gte: start,
      },
      userId,
    },
  })

  const monthlyRows = Array.from(
    rows.reduce((map, row) => {
      const year = row.date.getUTCFullYear()
      const month = row.date.getUTCMonth() + 1
      const key = `${year}-${month}-${row.type}`
      const current = map.get(key) ?? {
        month,
        total: 0,
        type: row.type,
        year,
      }

      current.total += Number(row.amount)
      map.set(key, current)

      return map
    }, new Map<string, { month: number; total: number; type: TransactionType; year: number }>())
  ).map(([, value]) => value)

  return buildSixMonthChartSeries(monthlyRows, anchorDate)
}
