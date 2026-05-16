import { NextResponse } from "next/server"

import { BlobUploadError, MissingBlobTokenError } from "@/lib/blob"
import { ReportPdfGenerationError, generateAndStoreReport } from "@/lib/report-service"
import { getRequestSession } from "@/lib/session"

export const runtime = "nodejs"

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
    return NextResponse.json(
      { error: "Body request tidak valid." },
      { status: 400 }
    )
  }

  const period = normalizeBodyMonthYear(body)

  if (!period) {
    return NextResponse.json(
      { error: "Input bulan atau tahun tidak valid." },
      { status: 400 }
    )
  }

  try {
    const result = await generateAndStoreReport(
      session.user.id,
      period.month,
      period.year
    )

    return NextResponse.json({ blobUrl: result.blobUrl })
  } catch (error) {
    if (error instanceof MissingBlobTokenError) {
      return NextResponse.json({ error: error.message }, { status: 503 })
    }

    if (error instanceof BlobUploadError) {
      return NextResponse.json({ error: error.message }, { status: 502 })
    }

    if (error instanceof ReportPdfGenerationError) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      { error: "Terjadi kesalahan saat membuat laporan." },
      { status: 500 }
    )
  }
}
