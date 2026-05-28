import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

// GET /api/vocabulary - List items with filters
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const type = url.searchParams.get("type") || ""
  const status = url.searchParams.get("status") || "active"
  const search = url.searchParams.get("search") || ""

  const where: Record<string, unknown> = {}
  if (type) where.itemType = type
  if (status) where.status = status
  if (search) where.content = { contains: search }

  const items = await db.learnedItem.findMany({
    where,
    include: { task: { select: { id: true, videoUrl: true } } },
    orderBy: { createdAt: "desc" },
  })

  // Stats
  const [totalActive, totalArchived, addedThisWeek] = await Promise.all([
    db.learnedItem.count({ where: { status: "active" } }),
    db.learnedItem.count({ where: { status: "archived" } }),
    db.learnedItem.count({
      where: {
        status: "active",
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
  ])

  return NextResponse.json({ items, stats: { totalActive, totalArchived, addedThisWeek } })
}
