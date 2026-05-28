import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

// GET /api/speaking/topics - List all topics with session count
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const search = url.searchParams.get("search") || ""
  const category = url.searchParams.get("category") || ""

  const where: Record<string, unknown> = {}
  if (search) {
    where.title = { contains: search }
  }
  if (category) {
    where.category = category
  }

  const topics = await db.speakingTopic.findMany({
    where,
    include: {
      _count: { select: { sessions: true } },
      sessions: {
        orderBy: { practicedOn: "desc" },
        take: 1,
        select: { practicedOn: true },
      },
    },
    orderBy: { title: "asc" },
  })

  const result = topics.map((t) => ({
    ...t,
    sessionCount: t._count.sessions,
    lastPracticed: t.sessions[0]?.practicedOn || null,
  }))

  return NextResponse.json(result)
}

// POST /api/speaking/topics - Create a new topic
export async function POST(req: NextRequest) {
  const body = await req.json()

  if (!body.title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 })
  }

  const topic = await db.speakingTopic.create({
    data: {
      title: body.title.trim(),
      category: body.category || null,
    },
  })

  return NextResponse.json(topic)
}
