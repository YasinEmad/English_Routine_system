import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  const today = new Date().toISOString().split("T")[0]

  // Week ago date
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weekAgoStr = weekAgo.toISOString().split("T")[0]

  const [
    todayTasksTotal,
    todayTasksCompleted,
    todayVocabulary,
    todayMistakes,
    weekSessions,
    totalActiveVocabulary,
    totalMistakes,
  ] = await Promise.all([
    db.listeningTask.count({ where: { scheduledFor: today } }),
    db.listeningTask.count({ where: { scheduledFor: today, completed: true } }),
    db.learnedItem.count({
      where: { createdAt: { gte: new Date(today) } },
    }),
    db.speakingMistake.count({
      where: { dateAdded: today },
    }),
    db.speakingSession.count({
      where: { practicedOn: { gte: weekAgoStr } },
    }),
    db.learnedItem.count({ where: { status: "active" } }),
    db.speakingMistake.count(),
  ])

  return NextResponse.json({
    todayTasksTotal,
    todayTasksCompleted,
    todayVocabulary,
    todayMistakes,
    weekSessions,
    totalActiveVocabulary,
    totalMistakes,
  })
}
