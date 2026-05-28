import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

// GET /api/listening/tasks - List all tasks with learned items
export async function GET() {
  const tasks = await db.listeningTask.findMany({
    include: { learnedItems: true },
    orderBy: { scheduledFor: "asc" },
  })
  return NextResponse.json(tasks)
}

// POST /api/listening/tasks - Create one or more tasks
export async function POST(req: NextRequest) {
  const body = await req.json()

  if (Array.isArray(body.tasks)) {
    const tasks = await Promise.all(
      body.tasks.map((t: { videoUrl: string; durationMin: number; scheduledFor: string }) =>
        db.listeningTask.create({ data: t })
      )
    )
    return NextResponse.json(tasks)
  }

  const task = await db.listeningTask.create({
    data: {
      videoUrl: body.videoUrl,
      durationMin: body.durationMin,
      scheduledFor: body.scheduledFor,
    },
  })
  return NextResponse.json(task)
}
