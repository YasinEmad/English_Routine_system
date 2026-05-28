import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

// GET /api/speaking/topics/[id] - Get topic with sessions
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const topic = await db.speakingTopic.findUnique({
    where: { id },
    include: {
      sessions: { orderBy: { createdAt: "desc" } },
    },
  })
  if (!topic) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(topic)
}

// PATCH /api/speaking/topics/[id] - Update topic (title, category, completed)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  const data: Record<string, unknown> = {}
  if (body.title !== undefined) data.title = body.title
  if (body.category !== undefined) data.category = body.category
  if (body.completed !== undefined) data.completed = body.completed

  const topic = await db.speakingTopic.update({
    where: { id },
    data,
    include: {
      sessions: { orderBy: { createdAt: "desc" } },
    },
  })
  return NextResponse.json(topic)
}

// DELETE /api/speaking/topics/[id] - Delete topic and its sessions
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await db.speakingTopic.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
