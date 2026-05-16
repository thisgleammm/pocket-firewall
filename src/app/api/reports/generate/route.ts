import { NextResponse } from "next/server"

import { getRequestSession } from "@/lib/session"
import { generateAndStoreReport } from "@/lib/report-service"

function normalizeBodyMonthYear(body: unknown) {
  if (!body || typeof body !== "object") {
    return null
  }

  const monthValue = "month" in body ? Number(body.month) : NaN
  const yearValue = "year" in body ? Number(body.year) : NaN

  if (!Number.isInteger(monthValue) || monthValue < 1 || monthValue > 12) {
    return null
  }

  if (!Number.isInteger(yearValue) || yearValue < 2000 || yearValue > 9999) {
    return null
  }

  return {
    month: monthValue,
    year: yearValue,
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

  const period = normalizeBodyMonthYear(body)

  if (!period) {
    return NextResponse.json({ error: "Invalid month or year" }, { status: 400 })
  }

  try {
    const result = await generateAndStoreReport(
      session.user.id,
      period.month,
      period.year
    )

    return NextResponse.json({ blobUrl: result.blobUrl })
  } catch {
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    )
  }
}
