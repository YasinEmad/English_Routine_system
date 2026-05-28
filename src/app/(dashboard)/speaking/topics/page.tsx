"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import {
  Search,
  Mic,
  CheckCircle2,
  Loader2,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

interface Topic {
  id: string
  title: string
  category: string | null
  completed: boolean
  sessionCount: number
  lastPracticed: string | null
}

const categories = [
  "All",
  "Technology",
  "Travel",
  "Work",
  "Movies",
  "Education",
  "Daily Routine",
  "Friendship",
  "Childhood",
  "Health",
  "Food",
]

const categoryColors: Record<string, string> = {
  Technology: "bg-sky-50 text-sky-700 border-sky-200/50 dark:bg-sky-950/50 dark:text-sky-400 dark:border-sky-800/50",
  Travel: "bg-emerald-50 text-emerald-700 border-emerald-200/50 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/50",
  Work: "bg-violet-50 text-violet-700 border-violet-200/50 dark:bg-violet-950/50 dark:text-violet-400 dark:border-violet-800/50",
  Movies: "bg-rose-50 text-rose-700 border-rose-200/50 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800/50",
  Education: "bg-amber-50 text-amber-700 border-amber-200/50 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800/50",
  "Daily Routine": "bg-teal-50 text-teal-700 border-teal-200/50 dark:bg-teal-950/50 dark:text-teal-400 dark:border-teal-800/50",
  Friendship: "bg-pink-50 text-pink-700 border-pink-200/50 dark:bg-pink-950/50 dark:text-pink-400 dark:border-pink-800/50",
  Childhood: "bg-orange-50 text-orange-700 border-orange-200/50 dark:bg-orange-950/50 dark:text-orange-400 dark:border-orange-800/50",
  Health: "bg-green-50 text-green-700 border-green-200/50 dark:bg-green-950/50 dark:text-green-400 dark:border-green-800/50",
  Food: "bg-yellow-50 text-yellow-700 border-yellow-200/50 dark:bg-yellow-950/50 dark:text-yellow-400 dark:border-yellow-800/50",
}

export default function SpeakingTopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("All")

  const fetchTopics = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (category && category !== "All") params.set("category", category)
      const res = await fetch(`/api/speaking/topics?${params}`)
      const data = await res.json()
      setTopics(data)
    } catch {
      // error
    } finally {
      setLoading(false)
    }
  }, [search, category])

  useEffect(() => {
    fetchTopics()
  }, [fetchTopics])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Speaking Topics</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Practice speaking on various topics</p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
          <Input
            placeholder="Search topics..."
            className="pl-9 h-10 bg-background/50 border-muted-foreground/15 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`
                rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 border
                ${category === cat
                  ? "gradient-bg text-white border-transparent shadow-sm shadow-teal-500/20"
                  : "bg-accent/50 text-muted-foreground border-border/50 hover:bg-accent hover:text-foreground"
                }
              `}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
          {topics.map((topic) => (
            <Link key={topic.id} href={`/speaking/topics/${topic.id}`}>
              <Card className="card-hover-lift cursor-pointer group transition-all duration-200 h-full">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="font-medium leading-snug group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors duration-200">
                      {topic.title}
                    </h3>
                    {topic.completed && (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {topic.category && (
                      <Badge className={`text-[10px] uppercase tracking-wider border ${categoryColors[topic.category] || "bg-accent/50 border-border/50"}`}>
                        {topic.category}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {topic.sessionCount} session{topic.sessionCount !== 1 ? "s" : ""}
                    </span>
                    {topic.lastPracticed && (
                      <span className="text-xs text-muted-foreground">
                        Last: {topic.lastPracticed}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
