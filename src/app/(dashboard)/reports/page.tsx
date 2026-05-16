import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatMonthYear } from "@/lib/finance"
import { requireServerSession } from "@/lib/session"
import { getSummaryForMonth } from "@/lib/transactions"

export default async function ReportsPage() {
  const session = await requireServerSession()
  const now = new Date()
  const month = now.getUTCMonth() + 1
  const year = now.getUTCFullYear()
  const summary = await getSummaryForMonth(session.user.id, month, year)

  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <h2 className="text-2xl font-semibold">Laporan</h2>
        <p className="text-sm text-muted-foreground">
          {formatMonthYear(month, year)}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Saat Ini</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>Total pemasukan: {summary.totalIncome.toLocaleString("id-ID")}</p>
          <p>Total pengeluaran: {summary.totalExpense.toLocaleString("id-ID")}</p>
          <p>Saldo akhir: {summary.balance.toLocaleString("id-ID")}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Export PDF</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Halaman laporan sudah aktif. Export PDF dan upload Blob belum saya sambung di langkah ini.
        </CardContent>
      </Card>
    </div>
  )
}
