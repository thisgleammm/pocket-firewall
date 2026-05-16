import { prisma } from "@/lib/db"
import { calculateSummary, getMonthRange } from "@/lib/finance"
import { uploadPdfReport } from "@/lib/blob"
import { generateReportPdfBuffer } from "@/lib/pdf"
import {
  buildReportBlobPath,
  buildReportDocumentData,
} from "@/lib/reports"

export async function getReportForMonth(userId: string, month: number, year: number) {
  return prisma.report.findFirst({
    orderBy: {
      createdAt: "desc",
    },
    where: {
      month,
      userId,
      year,
    },
  })
}

export async function getReportSourceData(userId: string, month: number, year: number) {
  const { end, start } = getMonthRange(month, year)

  const rows = await prisma.transaction.findMany({
    orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    select: {
      amount: true,
      category: {
        select: {
          name: true,
        },
      },
      date: true,
      note: true,
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

  const transactions = rows.map((row) => ({
    amount: Number(row.amount),
    categoryName: row.category.name,
    date: row.date.toISOString(),
    note: row.note,
    type: row.type,
  }))

  const summary = calculateSummary(
    transactions.map((row) => ({
      amount: row.amount,
      categoryName: row.categoryName,
      type: row.type,
    }))
  )

  return {
    report: buildReportDocumentData({
      month,
      summary,
      transactions,
      year,
    }),
    summary,
    transactions,
  }
}

export async function generateAndStoreReport(userId: string, month: number, year: number) {
  const { report } = await getReportSourceData(userId, month, year)
  const pdfBuffer = await generateReportPdfBuffer(report)
  const pathname = buildReportBlobPath(userId, month, year)
  const uploaded = await uploadPdfReport(pathname, pdfBuffer)

  const saved = await prisma.report.upsert({
    create: {
      blobUrl: uploaded.url,
      month,
      userId,
      year,
    },
    update: {
      blobUrl: uploaded.url,
    },
    where: {
      userId_month_year: {
        month,
        userId,
        year,
      },
    },
  })

  return {
    blobUrl: saved.blobUrl,
    report,
    reportId: saved.id,
  }
}
