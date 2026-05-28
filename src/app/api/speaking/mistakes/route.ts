import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

// GET /api/speaking/mistakes - List all mistakes
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const search = url.searchParams.get("search") || ""
  const dateFrom = url.searchParams.get("dateFrom") || ""
  const dateTo = url.searchParams.get("dateTo") || ""

  const where: Record<string, unknown> = {}
  if (search) {
    where.OR = [
      { wrongVersion: { contains: search } },
      { correctVersion: { contains: search } },
    ]
  }
  if (dateFrom || dateTo) {
    const dateFilter: Record<string, string> = {}
    if (dateFrom) dateFilter.gte = dateFrom
    if (dateTo) dateFilter.lte = dateTo
    where.dateAdded = dateFilter
  }

  const mistakes = await db.speakingMistake.findMany({
    where,
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(mistakes)
}

// POST /api/speaking/mistakes - Add a new mistake
export async function POST(req: NextRequest) {
  const body = await req.json()

  const mistake = await db.speakingMistake.create({
    data: {
      wrongVersion: body.wrongVersion,
      correctVersion: body.correctVersion,
      explanation: body.explanation,
      dateAdded: body.dateAdded || new Date().toISOString().split("T")[0],
    },
  })
  return NextResponse.json(mistake)
}
