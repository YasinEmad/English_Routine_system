"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import {
  Headphones,
  BookOpen,
  AlertTriangle,
  Mic,
  Library,
  XCircle,
} from "lucide-react"
import { format } from "date-fns"

interface DashboardStats {
  todayTasksTotal: number
  todayTasksCompleted: number
  todayVocabulary: number
  todayMistakes: number
  weekSessions: number
  totalActiveVocabulary: number
  totalMistakes: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => {
        setStats(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const widgets = stats
    ? [
        {
          title: "Today's Listening Tasks",
          href: "/listening",
          value: `${stats.todayTasksCompleted}/${stats.todayTasksTotal}`,
          description: `${Math.max(0, stats.todayTasksTotal - stats.todayTasksCompleted)} pending`,
          icon: Headphones,
          color: "text-emerald-600",
          bg: "bg-emerald-50 dark:bg-emerald-950/30",
        },
        {
          title: "New Vocabulary Today",
          href: "/vocabulary",
          value: stats.todayVocabulary,
          description: "Items added today",
          icon: BookOpen,
          color: "text-amber-600",
          bg: "bg-amber-50 dark:bg-amber-950/30",
        },
        {
          title: "New Mistakes Today",
          href: "/speaking",
          value: stats.todayMistakes,
          description: "Mistakes logged today",
          icon: AlertTriangle,
          color: "text-red-500",
          bg: "bg-red-50 dark:bg-red-950/30",
        },
        {
          title: "Speaking Sessions This Week",
          href: "/speaking",
          value: stats.weekSessions,
          description: "Last 7 days",
          icon: Mic,
          color: "text-teal-600",
          bg: "bg-teal-50 dark:bg-teal-950/30",
        },
        {
          title: "Total Active Vocabulary",
          href: "/vocabulary",
          value: stats.totalActiveVocabulary,
          description: "Active learned items",
          icon: Library,
          color: "text-emerald-600",
          bg: "bg-emerald-50 dark:bg-emerald-950/30",
        },
        {
          title: "Total Mistakes Logged",
          href: "/review",
          value: stats.totalMistakes,
          description: "All time mistakes",
          icon: XCircle,
          color: "text-rose-500",
          bg: "bg-rose-50 dark:bg-rose-950/30",
        },
      ]
    : []

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border/50 bg-background/80 backdrop-blur-md px-4 sticky top-0 z-30">
          <SidebarTrigger className="-ml-1 h-7 w-7 transition-colors duration-200 hover:bg-accent/60 rounded-md" />
        </header>
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              {format(new Date(), "EEEE, MMMM d, yyyy")}
            </p>
          </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-32 bg-muted rounded" />
                <div className="h-4 w-4 bg-muted rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted rounded mb-1" />
                <div className="h-3 w-24 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {widgets.map((widget) => (
            <Link key={widget.title} href={widget.href} className="block">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {widget.title}
                  </CardTitle>
                  <div className={`rounded-lg p-2 ${widget.bg}`}>
                    <widget.icon className={`h-4 w-4 ${widget.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{widget.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {widget.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
