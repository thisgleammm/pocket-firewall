import { NextResponse } from "next/server"

import { listCategoriesForUser } from "@/lib/categories"
import { prisma } from "@/lib/db"
import { isTransactionType } from "@/lib/finance"
import { getRequestSession } from "@/lib/session"

function serializeCategory(category: {
  id: string
  isDefault: boolean
  name: string
  type: string
}) {
  return {
    id: category.id,
    isDefault: category.isDefault,
    name: category.name,
    type: category.type,
  }
}

export async function GET(request: Request) {
  const session = await getRequestSession(request)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type")

  if (type && !isTransactionType(type)) {
    return NextResponse.json({ error: "Invalid transaction type" }, { status: 400 })
  }

  try {
    const transactionType = type && isTransactionType(type) ? type : undefined
    const categories = await listCategoriesForUser(
      session.user.id,
      transactionType
    )

    return NextResponse.json(categories.map(serializeCategory))
  } catch {
    return NextResponse.json(
      { error: "Failed to load categories" },
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

  const name =
    body && typeof body === "object" && "name" in body && typeof body.name === "string"
      ? body.name.trim()
      : ""
  const type =
    body && typeof body === "object" && "type" in body
      ? body.type
      : null

  if (name.length < 2 || name.length > 40) {
    return NextResponse.json(
      { error: "Category name must be 2-40 characters" },
      { status: 400 }
    )
  }

  if (!isTransactionType(type)) {
    return NextResponse.json({ error: "Invalid transaction type" }, { status: 400 })
  }

  try {
    const existing = await prisma.category.findFirst({
      where: {
        name,
        type,
        userId: session.user.id,
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Category already exists" },
        { status: 409 }
      )
    }

    const category = await prisma.category.create({
      data: {
        name,
        type,
        userId: session.user.id,
      },
    })

    return NextResponse.json(serializeCategory(category), { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    )
  }
}
