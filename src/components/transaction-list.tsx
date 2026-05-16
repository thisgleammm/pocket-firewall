"use client"

import { startTransition, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowDownCircle, ArrowUpCircle, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatShortDate } from "@/lib/finance"

interface TransactionItem {
  amount: number
  category: {
    id: string
    isDefault: boolean
    name: string
    type: "INCOME" | "EXPENSE"
  }
  createdAt: string
  date: string
  id: string
  note: string | null
  type: "INCOME" | "EXPENSE"
}

interface TransactionListProps {
  title?: string
  transactions: TransactionItem[]
}

export function TransactionList({
  title = "Transaksi",
  transactions,
}: TransactionListProps) {
  const router = useRouter()
  const [pendingId, setPendingId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Hapus transaksi ini?")

    if (!confirmed) {
      return
    }

    setPendingId(id)

    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error ?? "Gagal menghapus transaksi")
      }

      startTransition(() => router.refresh())
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Gagal menghapus transaksi"
      )
    } finally {
      setPendingId(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
            Belum ada transaksi.
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between rounded-xl border bg-card px-3 py-3 shadow-sm"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={
                      transaction.type === "INCOME"
                        ? "rounded-lg bg-emerald-100 p-2 text-emerald-700"
                        : "rounded-lg bg-rose-100 p-2 text-rose-700"
                    }
                  >
                    {transaction.type === "INCOME" ? (
                      <ArrowUpCircle className="h-5 w-5" />
                    ) : (
                      <ArrowDownCircle className="h-5 w-5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {transaction.note || transaction.category.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {transaction.category.name} • {formatShortDate(transaction.date)}
                    </p>
                  </div>
                </div>

                <div className="ml-3 flex items-center gap-2">
                  <div
                    className={
                      transaction.type === "INCOME"
                        ? "text-right text-sm font-bold text-emerald-600"
                        : "text-right text-sm font-bold text-rose-600"
                    }
                  >
                    {transaction.type === "INCOME" ? "+" : "-"}{" "}
                    {formatCurrency(transaction.amount)}
                  </div>

                  <Button
                    disabled={pendingId === transaction.id}
                    onClick={() => handleDelete(transaction.id)}
                    size="icon-sm"
                    type="button"
                    variant="ghost"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
