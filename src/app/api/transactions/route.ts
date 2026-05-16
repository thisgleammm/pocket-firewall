import { NextResponse } from "next/server"

import { findCategoryForUser } from "@/lib/categories"
import { normalizeMonthYear, parseAmountInput, isTransactionType } from "@/lib/finance"
import { prisma } from "@/lib/db"
import { getRequestSession } from "@/lib/session"
import { getTransactionsForMonth, serializeTransaction } from "@/lib/transactions"

export async function GET(request: Request) {
  const session = await getRequestSession(request)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const period = normalizeMonthYear(
    searchParams.get("month"),
    searchParams.get("year")
  )

  if (!period) {
    return NextResponse.json(
      { error: "Invalid month or year" },
      { status: 400 }
    )
  }

  try {
    const transactions = await getTransactionsForMonth(
      session.user.id,
      period.month,
      period.year
    )

    return NextResponse.json(transactions)
  } catch {
    return NextResponse.json(
      { error: "Failed to load transactions" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const session = await getRequestSession(request)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const amount =
    body && typeof body === "object" && "amount" in body
      ? parseAmountInput(body.amount)
      : null
  const categoryId =
    body && typeof body === "object" && "categoryId" in body && typeof body.categoryId === "string"
      ? body.categoryId
      : ""
  const type =
    body && typeof body === "object" && "type" in body
      ? body.type
      : null
  const note =
    body && typeof body === "object" && "note" in body && typeof body.note === "string"
      ? body.note.trim()
      : ""
  const dateValue =
    body && typeof body === "object" && "date" in body && typeof body.date === "string"
      ? body.date
      : null

  if (!amount) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
  }

  if (!categoryId) {
    return NextResponse.json({ error: "Category is required" }, { status: 400 })
  }

  if (!isTransactionType(type)) {
    return NextResponse.json({ error: "Invalid transaction type" }, { status: 400 })
  }

  if (note.length > 160) {
    return NextResponse.json(
      { error: "Note must be 160 characters or less" },
      { status: 400 }
    )
  }

  const category = await findCategoryForUser(session.user.id, categoryId)

  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 400 })
  }

  if (category.type !== type) {
    return NextResponse.json(
      { error: "Category type does not match transaction type" },
      { status: 400 }
    )
  }

  const date = dateValue ? new Date(dateValue) : new Date()

  if (Number.isNaN(date.getTime())) {
    return NextResponse.json({ error: "Invalid transaction date" }, { status: 400 })
  }

  try {
    const transaction = await prisma.transaction.create({
      data: {
        amount,
        categoryId,
        date,
        note: note || null,
        type,
        userId: session.user.id,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json(serializeTransaction(transaction), { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    )
  }
}
