import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

// POST /api/speaking/sessions - Add a new session
export async function POST(req: NextRequest) {
  const body = await req.json()

  const session = await db.speakingSession.create({
    data: {
      topicId: body.topicId,
      originalReply: body.originalReply,
      improvedReply: body.improvedReply,
      notes: body.notes,
      practicedOn: body.practicedOn || new Date().toISOString().split("T")[0],
    },
  })
  return NextResponse.json(session)
}
