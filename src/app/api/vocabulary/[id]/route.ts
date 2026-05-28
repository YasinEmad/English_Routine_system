import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

// PATCH /api/vocabulary/[id] - Update status, content, itemType, examples
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  const data: Record<string, unknown> = {}
  if (body.status !== undefined) data.status = body.status
  if (body.content !== undefined) data.content = body.content
  if (body.itemType !== undefined) data.itemType = body.itemType
  if (body.examples !== undefined) {
    data.examples = Array.isArray(body.examples)
      ? JSON.stringify(body.examples.filter((e: string) => e.trim() !== ""))
      : "[]"
  }

  try {
    const item = await db.learnedItem.update({
      where: { id },
      data,
    })
    return NextResponse.json(item)
  } catch {
    return NextResponse.json({ error: "Item not found" }, { status: 404 })
  }
}
