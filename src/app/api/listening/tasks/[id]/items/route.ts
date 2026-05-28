import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

// POST /api/listening/tasks/[id]/items - Add learned items to a task
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  const items = Array.isArray(body.items) ? body.items : [body]

  const created = await Promise.all(
    items.map((item: { content: string; itemType: string; examples?: string[] }) => {
      // Convert examples array to JSON string for storage
      const examplesJson = Array.isArray(item.examples) && item.examples.length > 0
        ? JSON.stringify(item.examples.filter((e: string) => e.trim() !== ""))
        : "[]"

      return db.learnedItem.create({
        data: {
          taskId: id,
          content: item.content,
          itemType: item.itemType,
          examples: examplesJson,
        },
      })
    })
  )
  return NextResponse.json(created)
}
