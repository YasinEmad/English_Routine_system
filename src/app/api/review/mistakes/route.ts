import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

// GET /api/review/mistakes - Fetch all mistakes (read-only view)
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

  // Stats
  const today = new Date().toISOString().split("T")[0]
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0]
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0]

  const [total, thisWeek, thisMonth] = await Promise.all([
    db.speakingMistake.count(),
    db.speakingMistake.count({ where: { dateAdded: { gte: weekAgo } } }),
    db.speakingMistake.count({ where: { dateAdded: { gte: monthAgo } } }),
  ])

  return NextResponse.json({ mistakes, stats: { total, thisWeek, thisMonth } })
}
