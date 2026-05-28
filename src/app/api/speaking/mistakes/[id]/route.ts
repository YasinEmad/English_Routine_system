import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

// PATCH /api/speaking/mistakes/[id] - Edit a mistake
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  const mistake = await db.speakingMistake.update({
    where: { id },
    data: {
      ...(body.wrongVersion !== undefined && { wrongVersion: body.wrongVersion }),
      ...(body.correctVersion !== undefined && { correctVersion: body.correctVersion }),
      ...(body.explanation !== undefined && { explanation: body.explanation }),
      ...(body.dateAdded !== undefined && { dateAdded: body.dateAdded }),
    },
  })
  return NextResponse.json(mistake)
}

// DELETE /api/speaking/mistakes/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await db.speakingMistake.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
