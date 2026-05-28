import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

// PATCH /api/speaking/sessions/[id] - Edit a session
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  const session = await db.speakingSession.update({
    where: { id },
    data: {
      ...(body.originalReply !== undefined && { originalReply: body.originalReply }),
      ...(body.improvedReply !== undefined && { improvedReply: body.improvedReply }),
      ...(body.notes !== undefined && { notes: body.notes }),
      ...(body.practicedOn !== undefined && { practicedOn: body.practicedOn }),
    },
  })
  return NextResponse.json(session)
}

// DELETE /api/speaking/sessions/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await db.speakingSession.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
