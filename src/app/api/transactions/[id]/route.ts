import { NextResponse } from "next/server"

import { findCategoryForUser } from "@/lib/categories"
import { isTransactionType, parseAmountInput } from "@/lib/finance"
import { prisma } from "@/lib/db"
import { getRequestSession } from "@/lib/session"
import { serializeTransaction } from "@/lib/transactions"

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getRequestSession(request)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await context.params

  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const existing = await prisma.transaction.findFirst({
    include: {
      category: true,
    },
    where: {
      id,
      userId: session.user.id,
    },
  })

  if (!existing) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
  }

  const amountProvided = Boolean(body && typeof body === "object" && "amount" in body)
  const amount = amountProvided ? parseAmountInput((body as { amount: unknown }).amount) : null
  const typeProvided = Boolean(body && typeof body === "object" && "type" in body)
  const type = typeProvided ? (body as { type: unknown }).type : existing.type
  const categoryIdProvided = Boolean(
    body &&
      typeof body === "object" &&
      "categoryId" in body &&
      typeof body.categoryId === "string"
  )
  const categoryId = categoryIdProvided
    ? (body as { categoryId: string }).categoryId
    : existing.categoryId
  const noteProvided = Boolean(body && typeof body === "object" && "note" in body)
  const note = noteProvided && typeof (body as { note?: unknown }).note === "string"
    ? (body as { note: string }).note.trim()
    : existing.note
  const dateProvided = Boolean(
    body &&
      typeof body === "object" &&
      "date" in body &&
      typeof body.date === "string"
  )
  const date = dateProvided
    ? new Date((body as { date: string }).date)
    : existing.date

  if (!amountProvided && !typeProvided && !categoryIdProvided && !noteProvided && !dateProvided) {
    return NextResponse.json({ error: "No changes provided" }, { status: 400 })
  }

  if (amountProvided && !amount) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
  }

  if (!isTransactionType(type)) {
    return NextResponse.json({ error: "Invalid transaction type" }, { status: 400 })
  }

  if (!categoryId) {
    return NextResponse.json({ error: "Category is required" }, { status: 400 })
  }

  if (typeof note === "string" && note.length > 160) {
    return NextResponse.json(
      { error: "Note must be 160 characters or less" },
      { status: 400 }
    )
  }

  if (Number.isNaN(date.getTime())) {
    return NextResponse.json({ error: "Invalid transaction date" }, { status: 400 })
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

  try {
    const updateData = {
      ...(amountProvided && amount ? { amount } : {}),
      categoryId,
      date,
      note: typeof note === "string" ? note || null : note,
      type,
    }

    const transaction = await prisma.transaction.update({
      data: updateData,
      include: {
        category: true,
      },
      where: {
        id,
      },
    })

    return NextResponse.json(serializeTransaction(transaction))
  } catch {
    return NextResponse.json(
      { error: "Failed to update transaction" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const session = await getRequestSession(request)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await context.params

  const existing = await prisma.transaction.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  })

  if (!existing) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
  }

  try {
    await prisma.transaction.delete({
      where: {
        id,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch {
    return NextResponse.json(
      { error: "Failed to delete transaction" },
      { status: 500 }
    )
  }
}
