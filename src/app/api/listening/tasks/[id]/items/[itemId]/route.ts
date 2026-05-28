import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

// PATCH /api/listening/tasks/[id]/items/[itemId] - Update a learned item
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { itemId } = await params
  const body = await req.json()

  const data: Record<string, unknown> = {}
  if (body.content !== undefined) data.content = body.content
  if (body.itemType !== undefined) data.itemType = body.itemType
  if (body.examples !== undefined) {
    data.examples = Array.isArray(body.examples)
      ? JSON.stringify(body.examples.filter((e: string) => e.trim() !== ""))
      : "[]"
  }

  try {
    const item = await db.learnedItem.update({
      where: { id: itemId },
      data,
    })
    return NextResponse.json(item)
  } catch {
    return NextResponse.json({ error: "Item not found" }, { status: 404 })
  }
}

// DELETE /api/listening/tasks/[id]/items/[itemId] - Delete a learned item
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { itemId } = await params

  try {
    await db.learnedItem.delete({ where: { id: itemId } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Item not found" }, { status: 404 })
  }
}
