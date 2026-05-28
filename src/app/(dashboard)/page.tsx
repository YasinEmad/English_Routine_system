"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { format } from "date-fns"
import Link from "next/link"
import {
  Headphones,
  BookOpen,
  AlertTriangle,
  Mic,
  Hash,
  XCircle,
  Plus,
  ArrowRight,
  TrendingUp,
  CalendarDays,
  Flame,
  Target,
  Sparkles,
  CheckCircle2,
  Clock,
  BarChart3,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

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
  const { data: session } = useSession()

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((data) => {
        setStats(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const today = format(new Date(), "EEEE, MMMM d")
  const greeting = (() => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  })()

  const userName = session?.user?.name || "Yasin"

  const listeningProgress = stats
    ? stats.todayTasksTotal > 0
      ? Math.round((stats.todayTasksCompleted / stats.todayTasksTotal) * 100)
      : 0
    : 0

  // Compute activity score (0-100)
  const activityScore = stats
    ? Math.min(100, Math.round(
        (stats.todayTasksCompleted * 20) +
        (stats.todayVocabulary * 10) +
        (stats.weekSessions * 10) +
        (stats.todayMistakes > 0 ? 5 : 0)
      ))
    : 0

  const widgets = stats
    ? [
        {
          title: "Today's Listening",
          value: `${stats.todayTasksCompleted}/${stats.todayTasksTotal}`,
          description: "Tasks completed today",
          icon: Headphones,
          color: "text-teal-600 dark:text-teal-400",
          bg: "bg-gradient-to-br from-teal-50 to-teal-100/50 dark:from-teal-950 dark:to-teal-900/30",
          borderAccent: "border-l-teal",
          progress: listeningProgress,
          href: "/listening",
        },
        {
          title: "New Vocabulary Today",
          value: stats.todayVocabulary,
          description: "Items added today",
          icon: BookOpen,
          color: "text-emerald-600 dark:text-emerald-400",
          bg: "bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950 dark:to-emerald-900/30",
          borderAccent: "border-l-emerald",
          href: "/vocabulary",
        },
        {
          title: "New Mistakes Today",
          value: stats.todayMistakes,
          description: "Mistakes logged today",
          icon: AlertTriangle,
          color: "text-amber-600 dark:text-amber-400",
          bg: "bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950 dark:to-amber-900/30",
          borderAccent: "border-l-amber",
          href: "/speaking",
        },
        {
          title: "Sessions This Week",
          value: stats.weekSessions,
          description: "Speaking practice sessions",
          icon: Mic,
          color: "text-sky-600 dark:text-sky-400",
          bg: "bg-gradient-to-br from-sky-50 to-sky-100/50 dark:from-sky-950 dark:to-sky-900/30",
          borderAccent: "border-l-sky",
          href: "/speaking",
        },
        {
          title: "Total Active Vocabulary",
          value: stats.totalActiveVocabulary,
          description: "All active learned items",
          icon: Hash,
          color: "text-violet-600 dark:text-violet-400",
          bg: "bg-gradient-to-br from-violet-50 to-violet-100/50 dark:from-violet-950 dark:to-violet-900/30",
          borderAccent: "border-l-violet",
          href: "/vocabulary",
        },
        {
          title: "Total Mistakes Logged",
          value: stats.totalMistakes,
          description: "All time mistakes",
          icon: XCircle,
          color: "text-rose-600 dark:text-rose-400",
          bg: "bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-950 dark:to-rose-900/30",
          borderAccent: "border-l-rose",
          href: "/review",
        },
      ]
    : []

  const quickActions = [
    { title: "Add Listening Task", description: "Schedule a new session", href: "/listening", icon: Headphones, color: "text-teal-600 dark:text-teal-400", bg: "from-teal-500 to-emerald-600" },
    { title: "Practice Speaking", description: "Start a topic", href: "/speaking", icon: Mic, color: "text-sky-600 dark:text-sky-400", bg: "from-sky-500 to-blue-600" },
    { title: "Review Mistakes", description: "Learn from errors", href: "/review", icon: AlertTriangle, color: "text-amber-600 dark:text-amber-400", bg: "from-amber-500 to-orange-600" },
    { title: "Browse Vocabulary", description: "Review your words", href: "/vocabulary", icon: BookOpen, color: "text-emerald-600 dark:text-emerald-400", bg: "from-emerald-500 to-teal-600" },
  ]

  const getMotivationMessage = () => {
    if (!stats) return "Loading your progress..."
    if (activityScore >= 80) return "Incredible work today! You're on fire!"
    if (activityScore >= 50) return "Great progress! Keep the momentum going!"
    if (activityScore >= 20) return "Good start! A little more practice and you'll be soaring!"
    if (stats.todayTasksTotal === 0) return "No tasks scheduled for today. Plan your learning session!"
    return "Ready to start learning? Let's make today count!"
  }

  const getMotivationEmoji = () => {
    if (!stats) return null
    if (activityScore >= 80) return <Flame className="h-5 w-5 text-orange-500" />
    if (activityScore >= 50) return <TrendingUp className="h-5 w-5 text-teal-500" />
    if (activityScore >= 20) return <Sparkles className="h-5 w-5 text-amber-500" />
    return <Target className="h-5 w-5 text-sky-500" />
  }

  return (
    <div className="space-y-8">
      {/* Hero Card */}
      <Card className="overflow-hidden border-0 shadow-lg shadow-teal-500/5 dark:shadow-teal-500/10">
        <div className="relative gradient-bg-subtle">
          {/* Decorative shapes */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-teal-400/10 blur-2xl" />
            <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-emerald-400/8 blur-xl" />
            <div className="absolute right-1/4 top-1/2 h-20 w-20 rounded-full bg-teal-300/5 blur-lg" />
          </div>
          <CardContent className="relative p-6 md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  <span>{today}</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight">
                  {greeting}, <span className="gradient-text">{userName}</span>
                </h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground max-w-md">
                  {getMotivationEmoji()}
                  <span>{getMotivationMessage()}</span>
                </div>
              </div>
              {/* Activity Ring */}
              <div className="flex items-center gap-5">
                <div className="relative flex h-24 w-24 items-center justify-center">
                  <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50" cy="50" r="42"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-muted/30"
                    />
                    <circle
                      cx="50" cy="50" r="42"
                      fill="none"
                      stroke="url(#progressGradient)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${activityScore * 2.64} 264`}
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="oklch(0.55 0.12 170)" />
                        <stop offset="100%" stopColor="oklch(0.5 0.14 165)" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-lg font-bold">{activityScore}%</span>
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Score</span>
                  </div>
                </div>
                <div className="hidden sm:flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span className="text-muted-foreground">Activity</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    <span className="text-muted-foreground">Daily Goal</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5" />
          Quick Actions
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="card-hover-lift cursor-pointer transition-all duration-200 group overflow-hidden border-0 shadow-sm">
                <CardContent className="p-0">
                  <div className="flex items-center gap-3 p-4">
                    <div className={`rounded-xl bg-gradient-to-br ${action.bg} p-2.5 shadow-sm transition-transform duration-200 group-hover:scale-110`}>
                      <action.icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium block">{action.title}</span>
                      <span className="text-[11px] text-muted-foreground">{action.description}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground/30 transition-all duration-200 group-hover:translate-x-1 group-hover:text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 rounded shimmer" />
                <div className="h-8 w-8 rounded-lg shimmer" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 rounded shimmer mb-2" />
                <div className="h-3 w-28 rounded shimmer" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <BarChart3 className="h-3.5 w-3.5" />
            Your Stats
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
            {widgets.map((widget) => (
              <Link key={widget.title} href={widget.href}>
                <Card className={`group cursor-pointer overflow-hidden transition-all duration-200 ${widget.borderAccent} card-hover-lift`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {widget.title}
                    </CardTitle>
                    <div className={`rounded-lg p-2 ${widget.bg} transition-transform duration-200 group-hover:scale-110`}>
                      <widget.icon className={`h-4 w-4 ${widget.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold tracking-tight">{widget.value}</div>
                    <p className="text-xs text-muted-foreground mt-0.5">{widget.description}</p>
                    {widget.progress !== undefined && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Progress</span>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-teal-500" />
                            <span className="text-[10px] font-medium text-teal-600 dark:text-teal-400">{widget.progress}%</span>
                          </div>
                        </div>
                        <Progress value={widget.progress} className="h-1.5" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
