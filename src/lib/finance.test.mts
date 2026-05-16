import assert from "node:assert/strict"
import test from "node:test"

import {
  buildSixMonthChartSeries,
  calculateSummary,
  DEFAULT_CATEGORY_NAMES,
  getMonthRange,
  parseAmountInput,
} from "./finance.ts"

test("parseAmountInput parses positive numeric strings", () => {
  assert.equal(parseAmountInput("12500"), 12500)
  assert.equal(parseAmountInput("12,500.40"), 12500.4)
  assert.equal(parseAmountInput("0"), null)
  assert.equal(parseAmountInput("-500"), null)
  assert.equal(parseAmountInput("abc"), null)
})

test("getMonthRange returns inclusive start and exclusive end", () => {
  const { start, end } = getMonthRange(2, 2026)

  assert.equal(start.toISOString(), "2026-02-01T00:00:00.000Z")
  assert.equal(end.toISOString(), "2026-03-01T00:00:00.000Z")
})

test("calculateSummary totals income, expense, balance, and category groups", () => {
  const summary = calculateSummary([
    { amount: 8000000, type: "INCOME", categoryName: "Gaji" },
    { amount: 25000, type: "EXPENSE", categoryName: "Makan" },
    { amount: 15000, type: "EXPENSE", categoryName: "Transport" },
    { amount: 5000, type: "EXPENSE", categoryName: "Makan" },
  ])

  assert.equal(summary.totalIncome, 8000000)
  assert.equal(summary.totalExpense, 45000)
  assert.equal(summary.balance, 7955000)
  assert.deepEqual(summary.byCategory, [
    { categoryName: "Makan", type: "EXPENSE", total: 30000 },
    { categoryName: "Transport", type: "EXPENSE", total: 15000 },
    { categoryName: "Gaji", type: "INCOME", total: 8000000 },
  ])
})

test("buildSixMonthChartSeries backfills empty months", () => {
  const series = buildSixMonthChartSeries(
    [
      { year: 2026, month: 1, type: "INCOME", total: 5000000 },
      { year: 2026, month: 1, type: "EXPENSE", total: 1000000 },
      { year: 2026, month: 3, type: "EXPENSE", total: 250000 },
      { year: 2026, month: 5, type: "INCOME", total: 9000000 },
    ],
    new Date("2026-05-16T12:00:00.000Z")
  )

  assert.equal(series.length, 6)
  assert.deepEqual(
    series.map((item) => ({
      key: item.key,
      income: item.income,
      expense: item.expense,
    })),
    [
      { key: "2025-12", income: 0, expense: 0 },
      { key: "2026-01", income: 5000000, expense: 1000000 },
      { key: "2026-02", income: 0, expense: 0 },
      { key: "2026-03", income: 0, expense: 250000 },
      { key: "2026-04", income: 0, expense: 0 },
      { key: "2026-05", income: 9000000, expense: 0 },
    ]
  )
})

test("default category names match spec", () => {
  assert.deepEqual(DEFAULT_CATEGORY_NAMES.EXPENSE, [
    "Makan",
    "Transport",
    "Kesehatan",
    "Belanja",
    "Hiburan",
    "Tagihan",
    "Lainnya",
  ])
  assert.deepEqual(DEFAULT_CATEGORY_NAMES.INCOME, [
    "Gaji",
    "Freelance",
    "Investasi",
    "Lainnya",
  ])
})
