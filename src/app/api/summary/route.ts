import { NextResponse } from "next/server"

import { normalizeMonthYear } from "@/lib/finance"
import { getRequestSession } from "@/lib/session"
import { getSummaryForMonth } from "@/lib/transactions"

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
    const summary = await getSummaryForMonth(
      session.user.id,
      period.month,
      period.year
    )

    return NextResponse.json(summary)
  } catch {
    return NextResponse.json(
      { error: "Failed to load summary" },
      { status: 500 }
    )
  }
}
