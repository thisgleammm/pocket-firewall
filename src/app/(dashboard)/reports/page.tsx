import { ReportExportButton } from "@/components/report-export-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatMonthYear } from "@/lib/finance"
import { isLastDayOfMonth } from "@/lib/report-notification"
import { getReportForMonth, getReportSourceData } from "@/lib/report-service"
import { requireServerSession } from "@/lib/session"

export default async function ReportsPage() {
  const session = await requireServerSession()
  const now = new Date()
  const month = now.getUTCMonth() + 1
  const year = now.getUTCFullYear()
  const [{ report }, existingReport] = await Promise.all([
    getReportSourceData(session.user.id, month, year),
    getReportForMonth(session.user.id, month, year),
  ])
  const showLastDayBanner = isLastDayOfMonth(now) && !existingReport

  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <h2 className="text-2xl font-semibold">Laporan</h2>
        <p className="text-sm text-muted-foreground">
          {formatMonthYear(month, year)}
        </p>
      </div>

      {showLastDayBanner ? (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
          <p className="font-semibold">Hari ini akhir bulan.</p>
          <p className="mt-1 text-amber-900/80">
            Report bulan ini belum di-generate. Buat PDF sekarang sebelum tutup buku.
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
            Generate laporan bulan ini kapan saja. File PDF di-upload ke Vercel Blob.
          </p>
          <ReportExportButton month={month} year={year} />
          {existingReport ? (
            <div className="rounded-xl border bg-muted/30 p-4">
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
                Buka PDF terakhir
              </a>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Saat Ini</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-xl border bg-muted/30 p-4">
            <p className="text-muted-foreground">Total pemasukan</p>
            <p className="mt-2 text-base font-semibold">
              {formatCurrency(report.summary.totalIncome)}
            </p>
          </div>
          <div className="rounded-xl border bg-muted/30 p-4">
            <p className="text-muted-foreground">Total pengeluaran</p>
            <p className="mt-2 text-base font-semibold">
              {formatCurrency(report.summary.totalExpense)}
            </p>
          </div>
          <div className="rounded-xl border bg-muted/30 p-4">
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
            <div className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
              Belum ada pengeluaran bulan ini.
            </div>
          ) : (
            <div className="space-y-3">
              {report.expenseByCategory.map((item) => (
                <div
                  key={`${item.categoryName}-${item.total}`}
                  className="flex items-center justify-between rounded-xl border bg-card px-4 py-3"
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
            <div className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
              Belum ada transaksi bulan ini.
            </div>
          ) : (
            <div className="space-y-3">
              {report.transactions.map((item, index) => (
                <div
                  key={`${item.dateLabel}-${item.categoryName}-${index}`}
                  className="flex items-start justify-between rounded-xl border bg-card px-4 py-3"
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
