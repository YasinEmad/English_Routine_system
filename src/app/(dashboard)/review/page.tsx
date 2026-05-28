"use client"

import { useEffect, useState, useCallback } from "react"
import { useDebounce } from "@/hooks/use-debounce"
import {
  Search,
  X,
  Check,
  CalendarDays,
  RotateCcw,
  Loader2,
  Brain,
  MessageSquare,
  Sparkles,
  ArrowRight,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/page-header"

interface Mistake {
  id: string
  wrongVersion: string
  correctVersion: string
  explanation: string | null
  dateAdded: string
}

interface ReviewStats {
  total: number
  thisWeek: number
  thisMonth: number
}

export default function ReviewPage() {
  const [mistakes, setMistakes] = useState<Mistake[]>([])
  const [stats, setStats] = useState<ReviewStats>({ total: 0, thisWeek: 0, thisMonth: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search)
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const fetchMistakes = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (debouncedSearch) params.set("search", debouncedSearch)
      if (dateFrom) params.set("dateFrom", dateFrom)
      if (dateTo) params.set("dateTo", dateTo)
      const res = await fetch(`/api/review/mistakes?${params}`)
      const data = await res.json()
      setMistakes(data.mistakes)
      setStats(data.stats)
    } catch {
      // error
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, dateFrom, dateTo])

  useEffect(() => {
    fetchMistakes()
  }, [fetchMistakes])

  return (
    <div className="space-y-8">
      <PageHeader
        title="Learn From My Mistakes"
        description="Review your speaking errors to avoid repeating them"
        icon={RotateCcw}
        gradient="bg-gradient-to-r from-amber-600 to-orange-600"
      />

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-3 stagger-children">
        <Card className="border-l-rose">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-rose-50 to-rose-100/50 p-2.5 dark:from-rose-950 dark:to-rose-900/30">
              <X className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Mistakes</p>
              <p className="text-2xl font-bold tracking-tight">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-amber">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 p-2.5 dark:from-amber-950 dark:to-amber-900/30">
              <RotateCcw className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">This Week</p>
              <p className="text-2xl font-bold tracking-tight">{stats.thisWeek}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-sky">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-sky-50 to-sky-100/50 p-2.5 dark:from-sky-950 dark:to-sky-900/30">
              <CalendarDays className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">This Month</p>
              <p className="text-2xl font-bold tracking-tight">{stats.thisMonth}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
          <Input
            placeholder="Search mistakes..."
            className="pl-9 pr-9 h-10 bg-background/50 border-muted-foreground/15 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors duration-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="w-full sm:w-40 h-10 bg-background/50 border-muted-foreground/15"
          placeholder="From"
        />
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="w-full sm:w-40 h-10 bg-background/50 border-muted-foreground/15"
          placeholder="To"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : mistakes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/50">
              <Brain className="h-8 w-8 text-amber-500/60" />
            </div>
            <h3 className="text-lg font-semibold">No mistakes to review</h3>
            <p className="text-sm text-muted-foreground mt-1">Mistakes from your Speaking practice will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 stagger-children">
          {mistakes.map((mistake) => (
            <Card key={mistake.id} className="overflow-hidden transition-all duration-200 hover:shadow-sm">
              <CardContent className="p-0">
                <div className="flex">
                  {/* Colored border indicators for wrong/correct */}
                  <div className="flex flex-col w-1.5 shrink-0">
                    <div className="flex-1 bg-destructive/40" />
                    <div className="flex-1 bg-emerald-500/40" />
                  </div>
                  <div className="flex-1 p-5 space-y-4">
                    {/* Wrong vs Correct - side by side on desktop */}
                    <div className="grid gap-3 md:grid-cols-2">
                      {/* Wrong version */}
                      <div className="rounded-xl bg-destructive/5 dark:bg-destructive/10 border border-destructive/10 dark:border-destructive/20 p-3.5 space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive/10">
                            <X className="h-3 w-3 text-destructive" />
                          </div>
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-destructive/70">Wrong</p>
                        </div>
                        <p className="font-medium text-sm pl-7">{mistake.wrongVersion}</p>
                      </div>

                      {/* Correct version */}
                      <div className="rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/30 dark:border-emerald-800/30 p-3.5 space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10">
                            <Check className="h-3 w-3 text-emerald-500" />
                          </div>
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-600/70 dark:text-emerald-400/70">Correct</p>
                        </div>
                        <p className="font-medium text-sm pl-7">{mistake.correctVersion}</p>
                      </div>
                    </div>

                    {/* Explanation */}
                    {mistake.explanation && (
                      <div className="flex items-start gap-2 pl-1">
                        <MessageSquare className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground bg-accent/30 rounded-md px-3 py-1.5 flex-1">{mistake.explanation}</p>
                      </div>
                    )}

                    {/* Date */}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60 pl-1">
                      <CalendarDays className="h-3 w-3" />
                      {mistake.dateAdded}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
