import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer"

import { formatCurrency } from "@/lib/finance"
import { type buildReportDocumentData } from "@/lib/reports"

type ReportDocumentData = ReturnType<typeof buildReportDocumentData>

const styles = StyleSheet.create({
  body: {
    color: "#151515",
    fontSize: 11,
    paddingBottom: 24,
    paddingHorizontal: 28,
    paddingTop: 28,
  },
  heading: {
    fontSize: 21,
    fontWeight: 700,
    marginBottom: 8,
  },
  muted: {
    color: "#5b5b5b",
    fontSize: 10,
  },
  section: {
    marginTop: 18,
  },
  sectionTitle: {
    backgroundColor: "#f16d3b",
    borderRadius: 8,
    color: "#111111",
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    textTransform: "uppercase",
  },
  summaryGrid: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
  },
  summaryCard: {
    backgroundColor: "#f7f1e9",
    border: "1 solid #eadbc7",
    borderRadius: 10,
    flexGrow: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  summaryLabel: {
    color: "#6a625a",
    fontSize: 9,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: 700,
  },
  table: {
    border: "1 solid #e5ddd2",
    borderRadius: 10,
    overflow: "hidden",
  },
  row: {
    alignItems: "stretch",
    borderBottom: "1 solid #eee5d8",
    display: "flex",
    flexDirection: "row",
  },
  headerRow: {
    backgroundColor: "#f7f1e9",
  },
  lastRow: {
    borderBottom: "0 solid transparent",
  },
  cell: {
    fontSize: 10,
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  cellHeader: {
    color: "#544d46",
    fontSize: 9,
    fontWeight: 700,
    textTransform: "uppercase",
  },
  right: {
    textAlign: "right",
  },
  expenseType: {
    color: "#b42318",
  },
  incomeType: {
    color: "#067647",
  },
})

function ReportPdfDocument({
  report,
}: {
  report: ReportDocumentData
}) {
  return (
    <Document
      author="PocketFirewall"
      creator="PocketFirewall"
      subject={report.title}
      title={report.title}
    >
      <Page size="A4" style={styles.body}>
        <Text style={styles.heading}>{report.title}</Text>
        <Text style={styles.muted}>
          Ringkasan bulanan, kategori pengeluaran, dan daftar transaksi.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ringkasan</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total Pemasukan</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(report.summary.totalIncome)}
              </Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total Pengeluaran</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(report.summary.totalExpense)}
              </Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Saldo Akhir</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(report.summary.balance)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pengeluaran Per Kategori</Text>
          <View style={styles.table}>
            <View style={[styles.row, styles.headerRow]}>
              <Text style={[styles.cell, styles.cellHeader, { width: "48%" }]}>
                Kategori
              </Text>
              <Text style={[styles.cell, styles.cellHeader, styles.right, { width: "30%" }]}>
                Total
              </Text>
              <Text style={[styles.cell, styles.cellHeader, styles.right, { width: "22%" }]}>
                %
              </Text>
            </View>
            {report.expenseByCategory.length === 0 ? (
              <View style={[styles.row, styles.lastRow]}>
                <Text style={[styles.cell, { width: "100%" }]}>
                  Belum ada pengeluaran bulan ini.
                </Text>
              </View>
            ) : (
              report.expenseByCategory.map((item, index) => (
                <View
                  key={`${item.categoryName}-${item.total}`}
                  style={
                    index === report.expenseByCategory.length - 1
                      ? [styles.row, styles.lastRow]
                      : styles.row
                  }
                >
                  <Text style={[styles.cell, { width: "48%" }]}>{item.categoryName}</Text>
                  <Text style={[styles.cell, styles.right, { width: "30%" }]}>
                    {formatCurrency(item.total)}
                  </Text>
                  <Text style={[styles.cell, styles.right, { width: "22%" }]}>
                    {item.percentage}%
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daftar Transaksi</Text>
          <View style={styles.table}>
            <View style={[styles.row, styles.headerRow]}>
              <Text style={[styles.cell, styles.cellHeader, { width: "15%" }]}>
                Tanggal
              </Text>
              <Text style={[styles.cell, styles.cellHeader, { width: "22%" }]}>
                Kategori
              </Text>
              <Text style={[styles.cell, styles.cellHeader, { width: "35%" }]}>
                Catatan
              </Text>
              <Text style={[styles.cell, styles.cellHeader, styles.right, { width: "28%" }]}>
                Jumlah
              </Text>
            </View>
            {report.transactions.length === 0 ? (
              <View style={[styles.row, styles.lastRow]}>
                <Text style={[styles.cell, { width: "100%" }]}>
                  Belum ada transaksi bulan ini.
                </Text>
              </View>
            ) : (
              report.transactions.map((item, index) => (
                <View
                  key={`${item.dateLabel}-${item.categoryName}-${index}`}
                  style={
                    index === report.transactions.length - 1
                      ? [styles.row, styles.lastRow]
                      : styles.row
                  }
                >
                  <Text style={[styles.cell, { width: "15%" }]}>{item.dateLabel}</Text>
                  <Text style={[styles.cell, { width: "22%" }]}>{item.categoryName}</Text>
                  <Text style={[styles.cell, { width: "35%" }]}>{item.note}</Text>
                  <Text
                    style={[
                      styles.cell,
                      styles.right,
                      item.type === "INCOME" ? styles.incomeType : styles.expenseType,
                      { width: "28%" },
                    ]}
                  >
                    {item.type === "INCOME" ? "+" : "-"} {formatCurrency(item.amount)}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>
      </Page>
    </Document>
  )
}

export async function generateReportPdfBuffer(report: ReportDocumentData) {
  return renderToBuffer(<ReportPdfDocument report={report} />)
}
