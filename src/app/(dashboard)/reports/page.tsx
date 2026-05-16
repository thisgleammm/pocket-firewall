import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { ReportExportButton } from "@/components/report-export-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  clampMonthYearToMax,
  compareMonthYear,
  formatCurrency,
  formatMonthYear,
  normalizeMonthYear,
  shiftMonthYear,
} from "@/lib/finance"
import { isLastDayOfMonth } from "@/lib/report-notification"
import { getReportForMonth, getReportSourceData } from "@/lib/report-service"
import { requireServerSession } from "@/lib/session"

type ReportsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

function pickSearchValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value ?? null
}

function buildPeriodHref(month: number, year: number) {
  return `/reports?month=${month}&year=${year}`
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const session = await requireServerSession()
  const now = new Date()
  const currentPeriod = {
    month: now.getUTCMonth() + 1,
    year: now.getUTCFullYear(),
  }
  const resolvedSearchParams = await searchParams
  const requestedPeriod =
    normalizeMonthYear(
      pickSearchValue(resolvedSearchParams?.month),
      pickSearchValue(resolvedSearchParams?.year),
      now
    ) ?? currentPeriod
  const selectedPeriod = clampMonthYearToMax(requestedPeriod, currentPeriod)
  const month = selectedPeriod.month
  const year = selectedPeriod.year
  const isCurrentPeriod = compareMonthYear(selectedPeriod, currentPeriod) === 0
  const previousPeriod = shiftMonthYear(selectedPeriod, -1)
  const nextPeriod = shiftMonthYear(selectedPeriod, 1)
  const activeLabel = formatMonthYear(month, year)
  const [{ report }, existingReport] = await Promise.all([
    getReportSourceData(session.user.id, month, year),
    getReportForMonth(session.user.id, month, year),
  ])
  const showLastDayBanner =
    isCurrentPeriod && isLastDayOfMonth(now) && !existingReport

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Laporan</h2>
          <p className="text-sm text-muted-foreground">{activeLabel}</p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <Button
            asChild
            className="h-12 w-12 rounded-[calc(var(--radius)+6px)]"
            size="icon"
            variant="outline"
          >
            <Link
              aria-label={`Lihat laporan ${formatMonthYear(previousPeriod.month, previousPeriod.year)}`}
              href={buildPeriodHref(previousPeriod.month, previousPeriod.year)}
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="min-w-[12rem] rounded-[calc(var(--radius)+6px)] border border-border/80 bg-card px-4 py-3 text-center shadow-[0_12px_30px_rgba(77,57,39,0.08)]">
            <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-muted-foreground">
              Periode aktif
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {activeLabel}
            </p>
          </div>
          {isCurrentPeriod ? (
            <Button
              className="h-12 w-12 rounded-[calc(var(--radius)+6px)]"
              disabled
              size="icon"
              variant="outline"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          ) : (
            <Button
              asChild
              className="h-12 w-12 rounded-[calc(var(--radius)+6px)]"
              size="icon"
              variant="outline"
            >
              <Link
                aria-label={`Lihat laporan ${formatMonthYear(nextPeriod.month, nextPeriod.year)}`}
                href={buildPeriodHref(nextPeriod.month, nextPeriod.year)}
              >
                <ChevronRight className="h-5 w-5" />
              </Link>
            </Button>
          )}
        </div>
      </div>

      {showLastDayBanner ? (
        <div className="rounded-[calc(var(--radius)+8px)] border border-primary/35 bg-primary/12 p-4 text-sm text-foreground shadow-[0_18px_40px_rgba(145,70,29,0.10)]">
          <p className="font-semibold">Hari ini akhir bulan.</p>
          <p className="mt-1 text-foreground/78">
            Report {activeLabel} belum di-generate. Buat PDF sekarang sebelum
            tutup buku.
          </p>
          <div className="mt-4">
            <ReportExportButton month={month} year={year} />
          </div>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Generate PDF</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p className="text-muted-foreground">
            Generate laporan {activeLabel} kapan saja. File PDF akan di-upload ke
            Vercel Blob.
          </p>
          <ReportExportButton month={month} year={year} />
          {existingReport ? (
            <div className="rounded-[calc(var(--radius)+4px)] border border-border/80 bg-muted/35 p-4">
              <p className="font-medium">Report aktif sudah ada.</p>
              <p className="mt-1 text-muted-foreground">
                Dibuat {existingReport.createdAt.toLocaleString("id-ID")}
              </p>
              <a
                className="mt-3 inline-flex text-sm font-medium text-primary underline underline-offset-4"
                href={existingReport.blobUrl}
                rel="noreferrer"
                target="_blank"
              >
                Buka PDF {activeLabel}
              </a>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ringkasan {activeLabel}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-[calc(var(--radius)+4px)] border border-border/80 bg-muted/35 p-4">
            <p className="text-muted-foreground">Total pemasukan</p>
            <p className="mt-2 text-base font-semibold">
              {formatCurrency(report.summary.totalIncome)}
            </p>
          </div>
          <div className="rounded-[calc(var(--radius)+4px)] border border-border/80 bg-muted/35 p-4">
            <p className="text-muted-foreground">Total pengeluaran</p>
            <p className="mt-2 text-base font-semibold">
              {formatCurrency(report.summary.totalExpense)}
            </p>
          </div>
          <div className="rounded-[calc(var(--radius)+4px)] border border-border/80 bg-muted/35 p-4">
            <p className="text-muted-foreground">Saldo akhir</p>
            <p className="mt-2 text-base font-semibold">
              {formatCurrency(report.summary.balance)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pengeluaran Per Kategori</CardTitle>
        </CardHeader>
        <CardContent>
          {report.expenseByCategory.length === 0 ? (
            <div className="rounded-[calc(var(--radius)+4px)] border border-dashed border-border/80 px-4 py-8 text-center text-sm text-muted-foreground">
              Belum ada pengeluaran untuk {activeLabel}.
            </div>
          ) : (
            <div className="space-y-3">
              {report.expenseByCategory.map((item) => (
                <div
                  key={`${item.categoryName}-${item.total}`}
                  className="flex items-center justify-between rounded-[calc(var(--radius)+4px)] border border-border/80 bg-card px-4 py-3"
                >
                  <div>
                    <p className="font-medium">{item.categoryName}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.percentage}% dari total pengeluaran
                    </p>
                  </div>
                  <div className="text-right font-semibold">
                    {formatCurrency(item.total)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          {report.transactions.length === 0 ? (
            <div className="rounded-[calc(var(--radius)+4px)] border border-dashed border-border/80 px-4 py-8 text-center text-sm text-muted-foreground">
              Belum ada transaksi untuk {activeLabel}.
            </div>
          ) : (
            <div className="space-y-3">
              {report.transactions.map((item, index) => (
                <div
                  key={`${item.dateLabel}-${item.categoryName}-${index}`}
                  className="flex items-start justify-between rounded-[calc(var(--radius)+4px)] border border-border/80 bg-card px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium">
                      {item.categoryName} • {item.dateLabel}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {item.note}
                    </p>
                  </div>
                  <div className="ml-4 shrink-0 text-right font-semibold">
                    {item.type === "INCOME" ? "+" : "-"} {formatCurrency(item.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
