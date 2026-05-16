"use client"

import { startTransition, useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type TransactionTypeValue = "INCOME" | "EXPENSE"

export function CategoryManager() {
  const router = useRouter()
  const [type, setType] = useState<TransactionTypeValue>("EXPENSE")
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/categories", {
        body: JSON.stringify({ name, type }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? "Gagal menambah kategori")
      }

      setName("")
      startTransition(() => router.refresh())
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Gagal menambah kategori"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tambah Kategori</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-2">
            {(["EXPENSE", "INCOME"] as const).map((nextType) => (
              <Button
                key={nextType}
                onClick={() => setType(nextType)}
                type="button"
                variant={type === nextType ? "default" : "outline"}
              >
                {nextType === "EXPENSE" ? "Pengeluaran" : "Pemasukan"}
              </Button>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-name">Nama Kategori</Label>
            <Input
              id="category-name"
              onChange={(event) => setName(event.target.value)}
              placeholder="Contoh: Parkir"
              required
              value={name}
            />
          </div>

          {error ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? "Menyimpan..." : "Tambah Kategori"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
