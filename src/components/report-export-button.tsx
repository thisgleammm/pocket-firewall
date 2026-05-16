"use client"

import { startTransition, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowUpRight, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"

interface ReportExportButtonProps {
  month: number
  year: number
}

export function ReportExportButton({
  month,
  year,
}: ReportExportButtonProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function handleGenerate() {
    setError(null)
    setIsPending(true)

    try {
      const response = await fetch("/api/reports/generate", {
        body: JSON.stringify({ month, year }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      })

      const data = (await response.json().catch(() => null)) as
        | { blobUrl?: string; error?: string }
        | null

      if (!response.ok) {
        throw new Error(data?.error ?? "Gagal generate laporan")
      }

      if (!data?.blobUrl) {
        throw new Error(
          "PDF selesai dibuat, tapi URL file tidak tersedia. Periksa konfigurasi upload Blob lalu coba lagi."
        )
      }

      startTransition(() => router.refresh())
      window.open(data.blobUrl, "_blank", "noopener,noreferrer")
    } catch (generateError) {
      setError(
        generateError instanceof Error
          ? generateError.message
          : "Gagal generate laporan"
      )
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="space-y-3">
      <Button
        className="h-12 w-full sm:w-auto"
        disabled={isPending}
        onClick={handleGenerate}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ArrowUpRight className="h-4 w-4" />
        )}
        Generate & Export PDF
      </Button>
      {error ? (
        <div className="rounded-[calc(var(--radius)+2px)] border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm leading-6 text-destructive">
          {error}
        </div>
      ) : null}
    </div>
  )
}
