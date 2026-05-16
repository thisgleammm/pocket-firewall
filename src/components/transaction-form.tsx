"use client"

import { startTransition, useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type TransactionTypeValue = "INCOME" | "EXPENSE"

interface CategoryOption {
  id: string
  isDefault: boolean
  name: string
  type: TransactionTypeValue
}

interface TransactionFormProps {
  categories: CategoryOption[]
  defaultDate: string
}

function firstCategoryId(
  categories: CategoryOption[],
  type: TransactionTypeValue
) {
  return categories.find((category) => category.type === type)?.id ?? ""
}

export function TransactionForm({
  categories,
  defaultDate,
}: TransactionFormProps) {
  const router = useRouter()
  const [type, setType] = useState<TransactionTypeValue>("EXPENSE")
  const [amount, setAmount] = useState("")
  const [categoryId, setCategoryId] = useState(
    firstCategoryId(categories, "EXPENSE")
  )
  const [customCategoryName, setCustomCategoryName] = useState("")
  const [note, setNote] = useState("")
  const [date, setDate] = useState(defaultDate)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filteredCategories = categories.filter((category) => category.type === type)
  const currentCategoryId = filteredCategories.some(
    (category) => category.id === categoryId
  )
    ? categoryId
    : firstCategoryId(categories, type)

  const selectedCategory = filteredCategories.find(
    (category) => category.id === currentCategoryId
  )
  const showCustomCategoryInput = selectedCategory?.name === "Lainnya"

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      let finalCategoryId = currentCategoryId

      if (!finalCategoryId) {
        throw new Error("Kategori wajib dipilih")
      }

      if (showCustomCategoryInput) {
        const trimmedName = customCategoryName.trim()

        if (trimmedName.length < 2) {
          throw new Error("Nama kategori baru minimal 2 karakter")
        }

        const categoryResponse = await fetch("/api/categories", {
          body: JSON.stringify({
            name: trimmedName,
            type,
          }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        })

        const categoryData = await categoryResponse.json()

        if (!categoryResponse.ok) {
          throw new Error(categoryData.error ?? "Gagal membuat kategori")
        }

        finalCategoryId = categoryData.id
      }

      const response = await fetch("/api/transactions", {
        body: JSON.stringify({
          amount,
          categoryId: finalCategoryId,
          date,
          note,
          type,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? "Gagal menyimpan transaksi")
      }

      setAmount("")
      setCustomCategoryName("")
      setNote("")
      setDate(defaultDate)
      setCategoryId(firstCategoryId(categories, type))
      startTransition(() => router.refresh())
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Gagal menyimpan transaksi"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card id="new-transaction">
      <CardHeader>
        <CardTitle>Tambah Transaksi</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-2">
            {(["EXPENSE", "INCOME"] as const).map((nextType) => (
              <Button
                key={nextType}
                className="h-12"
                onClick={() => {
                  setType(nextType)
                  setCategoryId(firstCategoryId(categories, nextType))
                }}
                type="button"
                variant={type === nextType ? "default" : "outline"}
              >
                {nextType === "EXPENSE" ? "Pengeluaran" : "Pemasukan"}
              </Button>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Nominal</Label>
            <Input
              id="amount"
              inputMode="decimal"
              onChange={(event) => setAmount(event.target.value)}
              placeholder="150000"
              required
              value={amount}
            />
          </div>

          <div className="space-y-2">
            <Label>Kategori</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {filteredCategories.map((category) => (
                <button
                  key={category.id}
                  className={cn(
                    "rounded-xl border px-3 py-3 text-left text-sm font-medium transition-colors",
                    currentCategoryId === category.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card hover:bg-muted"
                  )}
                  onClick={() => setCategoryId(category.id)}
                  type="button"
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {showCustomCategoryInput ? (
            <div className="space-y-2">
              <Label htmlFor="custom-category">Kategori Baru</Label>
              <Input
                id="custom-category"
                onChange={(event) => setCustomCategoryName(event.target.value)}
                placeholder="Contoh: Kopi"
                required
                value={customCategoryName}
              />
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="note">Catatan</Label>
            <Input
              id="note"
              maxLength={160}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Opsional"
              value={note}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Tanggal</Label>
            <Input
              id="date"
              onChange={(event) => setDate(event.target.value)}
              required
              type="date"
              value={date}
            />
          </div>

          {error ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <Button className="h-12 w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Menyimpan..." : "Simpan Transaksi"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
