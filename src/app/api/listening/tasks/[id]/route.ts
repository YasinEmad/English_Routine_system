import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

// PATCH /api/listening/tasks/[id] - Update task (mark complete, etc.)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  const task = await db.listeningTask.update({
    where: { id },
    data: {
      ...(body.completed !== undefined && {
        completed: body.completed,
        completedAt: body.completed ? new Date() : null,
      }),
    },
  })
  return NextResponse.json(task)
}

// DELETE /api/listening/tasks/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await db.listeningTask.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
