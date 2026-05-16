import assert from "node:assert/strict"
import test from "node:test"

import {
  buildReportBlobPath,
  buildReportDocumentData,
  buildReportFileBase,
} from "./reports.ts"

test("buildReportFileBase zero pads month", () => {
  assert.equal(buildReportFileBase(5, 2026), "2026-05")
  assert.equal(buildReportFileBase(11, 2026), "2026-11")
})

test("buildReportBlobPath nests by user and month", () => {
  assert.equal(
    buildReportBlobPath("user_123", 5, 2026),
    "reports/user_123/2026-05.pdf"
  )
})

test("buildReportDocumentData returns summary and expense percentages", () => {
  const report = buildReportDocumentData({
    month: 5,
    summary: {
      balance: 3850000,
      byCategory: [
        { categoryName: "Makan", total: 300000, type: "EXPENSE" },
        { categoryName: "Transport", total: 200000, type: "EXPENSE" },
        { categoryName: "Gaji", total: 5000000, type: "INCOME" },
      ],
      totalExpense: 500000,
      totalIncome: 4350000,
    },
    transactions: [
      {
        amount: 250000,
        categoryName: "Makan",
        date: "2026-05-02T00:00:00.000Z",
        note: "Belanja mingguan",
        type: "EXPENSE",
      },
      {
        amount: 5000000,
        categoryName: "Gaji",
        date: "2026-05-01T00:00:00.000Z",
        note: null,
        type: "INCOME",
      },
      {
        amount: 200000,
        categoryName: "Transport",
        date: "2026-05-03T00:00:00.000Z",
        note: null,
        type: "EXPENSE",
      },
      {
        amount: 50000,
        categoryName: "Makan",
        date: "2026-05-05T00:00:00.000Z",
        note: "Kopi",
        type: "EXPENSE",
      },
    ],
    year: 2026,
  })

  assert.equal(report.title, "PocketFirewall — Laporan Bulan Mei 2026")
  assert.deepEqual(report.expenseByCategory, [
    { categoryName: "Makan", percentage: 60, total: 300000 },
    { categoryName: "Transport", percentage: 40, total: 200000 },
  ])
  assert.deepEqual(report.transactions[0], {
    amount: 5000000,
    categoryName: "Gaji",
    dateLabel: "1 Mei",
    note: "-",
    type: "INCOME",
  })
  assert.deepEqual(report.transactions[3], {
    amount: 50000,
    categoryName: "Makan",
    dateLabel: "5 Mei",
    note: "Kopi",
    type: "EXPENSE",
  })
})
