"use client"

import { useEffect, useState, useCallback } from "react"
import { useDebounce } from "@/hooks/use-debounce"
import {
  Search,
  Archive,
  RotateCcw,
  BookOpen,
  ExternalLink,
  Trash2,
  Loader2,
  MessageSquareQuote,
  BookMarked,
  AlignLeft,
  X,
  Pencil,
  Check,
  Sparkles,
  CalendarDays,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { PageHeader } from "@/components/page-header"

interface TaskRef {
  id: string
  videoUrl: string
}

interface VocabItem {
  id: string
  content: string
  itemType: string
  examples: string
  status: string
  createdAt: string
  task: TaskRef
}

interface VocabStats {
  totalActive: number
  totalArchived: number
  addedThisWeek: number
}

const typeConfig: Record<string, {
  badge: string
  icon: typeof BookOpen
  accent: string
  bar: string
  exampleBorder: string
}> = {
  expression: {
    badge: "bg-amber-500/12 text-amber-300 border-amber-500/30",
    icon: MessageSquareQuote,
    accent: "from-amber-500/10 via-transparent to-transparent",
    bar: "bg-amber-400",
    exampleBorder: "border-amber-500/20 bg-amber-500/5",
  },
  vocabulary: {
    badge: "bg-emerald-500/12 text-emerald-300 border-emerald-500/30",
    icon: BookMarked,
    accent: "from-emerald-500/10 via-transparent to-transparent",
    bar: "bg-emerald-400",
    exampleBorder: "border-emerald-500/20 bg-emerald-500/5",
  },
  sentence: {
    badge: "bg-sky-500/12 text-sky-300 border-sky-500/30",
    icon: AlignLeft,
    accent: "from-sky-500/10 via-transparent to-transparent",
    bar: "bg-sky-400",
    exampleBorder: "border-sky-500/20 bg-sky-500/5",
  },
}

// ═══════════════════════════════════════════════════════════════════════════════
// Vocab Item Card
// ═══════════════════════════════════════════════════════════════════════════════

function VocabItemCard({ item, onUpdated }: {
  item: VocabItem
  onUpdated: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(item.content)
  const [editType, setEditType] = useState(item.itemType)
  const [editEx1, setEditEx1] = useState("")
  const [editEx2, setEditEx2] = useState("")

  const config = typeConfig[item.itemType] ?? typeConfig.vocabulary
  const Icon = config.icon

  let parsedExamples: string[] = []
  try { parsedExamples = JSON.parse(item.examples || "[]") } catch { /* ignore */ }

  const startEdit = () => {
    setEditContent(item.content)
    setEditType(item.itemType)
    setEditEx1(parsedExamples[0] || "")
    setEditEx2(parsedExamples[1] || "")
    setEditing(true)
  }

  const saveEdit = async () => {
    if (!editContent.trim()) return
    const examples: string[] = []
    if (editEx1.trim()) examples.push(editEx1.trim())
    if (editEx2.trim()) examples.push(editEx2.trim())
    try {
      await fetch(`/api/vocabulary/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent.trim(), itemType: editType, examples }),
      })
      setEditing(false)
      toast.success("Item updated!")
      onUpdated()
    } catch {
      toast.error("Failed to update item")
    }
  }

  const updateStatus = async (status: string) => {
    try {
      await fetch(`/api/vocabulary/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      toast.success(
        status === "archived" ? "Item archived" :
        status === "active" ? "Item restored" : "Item removed"
      )
      onUpdated()
    } catch {
      toast.error("Failed to update item")
    }
  }

  // ── Edit Mode ──────────────────────────────────────────────────────────────
  if (editing) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900/90 p-5 shadow-xl backdrop-blur-sm">
        <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${config.accent}`} />
        <div className="relative space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">Editing item</p>
          <Input
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            placeholder="Word / expression / sentence"
            className="h-10 border-slate-700 bg-slate-800/80 text-slate-100 placeholder:text-slate-500 focus:border-teal-500/70 focus:ring-teal-500/20 text-base"
            onKeyDown={(e) => e.key === "Enter" && saveEdit()}
          />
          <Select value={editType} onValueChange={setEditType}>
            <SelectTrigger className="h-9 border-slate-700 bg-slate-800/80 text-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-slate-700 bg-slate-900 text-slate-200">
              <SelectItem value="vocabulary">Vocabulary</SelectItem>
              <SelectItem value="expression">Expression</SelectItem>
              <SelectItem value="sentence">Sentence</SelectItem>
            </SelectContent>
          </Select>
          <Input
            value={editEx1}
            onChange={(e) => setEditEx1(e.target.value)}
            placeholder="Example 1 (optional)"
            className="h-9 border-slate-700 bg-slate-800/80 text-slate-100 placeholder:text-slate-500 focus:border-teal-500/70 focus:ring-teal-500/20"
          />
          <Input
            value={editEx2}
            onChange={(e) => setEditEx2(e.target.value)}
            placeholder="Example 2 (optional)"
            className="h-9 border-slate-700 bg-slate-800/80 text-slate-100 placeholder:text-slate-500 focus:border-teal-500/70 focus:ring-teal-500/20"
          />
          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              onClick={saveEdit}
              className="h-8 gap-1.5 bg-teal-500 text-slate-950 hover:bg-teal-400 font-semibold"
            >
              <Check className="h-3.5 w-3.5" /> Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditing(false)}
              className="h-8 border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ── Display Card ───────────────────────────────────────────────────────────
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-900/90 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-slate-600/70 hover:shadow-xl">
      {/* Accent gradient top-left */}
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${config.accent}`} />
      {/* Left color bar */}
      <div className={`absolute left-0 top-0 h-full w-1 rounded-l-2xl ${config.bar}`} />

      <div className="relative flex flex-col gap-4 p-5 pl-6">

        {/* ── Header row: badges + actions ── */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-widest ${config.badge}`}>
              <Icon className="h-3 w-3" />
              {item.itemType}
            </span>
            <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-widest ${
              item.status === "active"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-amber-500/30 bg-amber-500/10 text-amber-300"
            }`}>
              {item.status}
            </span>
          </div>

          {/* Action buttons always visible */}
          <div className="flex items-center gap-1 shrink-0">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 rounded-xl text-slate-500 hover:bg-slate-700/60 hover:text-teal-300"
              onClick={startEdit}
              aria-label="Edit"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            {item.status === "active" ? (
              <Button size="sm" variant="ghost" onClick={() => updateStatus("archived")}
                className="h-8 w-8 rounded-xl text-slate-500 hover:bg-slate-700/60 hover:text-amber-300"
                aria-label="Archive">
                <Archive className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button size="sm" variant="ghost" onClick={() => updateStatus("active")}
                className="h-8 w-8 rounded-xl text-slate-500 hover:bg-slate-700/60 hover:text-emerald-300"
                aria-label="Restore">
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => updateStatus("removed")}
              className="h-8 w-8 rounded-xl text-slate-500 hover:bg-rose-500/10 hover:text-rose-400"
              aria-label="Remove">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* ── Word / content ── */}
        <div>
          <p className="break-words text-2xl font-bold leading-tight tracking-tight text-slate-50 sm:text-3xl">
            {item.content}
          </p>
        </div>

        {/* ── Examples ── */}
        {parsedExamples.length > 0 ? (
          <div className="space-y-2">
            {parsedExamples.map((ex, i) => (
              <div
                key={i}
                className={`rounded-xl border p-3.5 ${config.exampleBorder}`}
              >
                <div className="mb-1.5 flex items-center gap-1.5">
                  <MessageSquareQuote className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-400">
                    Example {i + 1}
                  </span>
                </div>
                <p className="break-words text-sm leading-6 text-slate-300">{ex}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-700/50 bg-slate-800/30 px-4 py-3">
            <p className="text-xs text-slate-500">No examples yet — click edit to add some.</p>
          </div>
        )}

        {/* ── Footer: date + source link ── */}
        <div className="flex items-center justify-between gap-3 border-t border-slate-800/80 pt-3">
          <div className="flex items-center gap-1.5 text-slate-500">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" />
            <span className="text-xs">
              {new Date(item.createdAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          <a
            href={item.task.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-500/10 border border-teal-500/20 px-3 py-1.5 text-xs font-semibold text-teal-400 transition hover:bg-teal-500/20 hover:text-teal-300"
          >
            <ExternalLink className="h-3 w-3 shrink-0" />
            Source
          </a>
        </div>

      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Vocabulary Page
// ═══════════════════════════════════════════════════════════════════════════════

export default function VocabularyPage() {
  const [items, setItems] = useState<VocabItem[]>([])
  const [stats, setStats] = useState<VocabStats>({ totalActive: 0, totalArchived: 0, addedThisWeek: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search)
  const [type, setType] = useState("")
  const [showArchived, setShowArchived] = useState(false)

  const fetchVocab = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (type) params.set("type", type)
      params.set("status", showArchived ? "archived" : "active")
      if (debouncedSearch) params.set("search", debouncedSearch)
      const res = await fetch(`/api/vocabulary?${params}`)
      const data = await res.json()
      setItems(data.items)
      setStats(data.stats)
    } catch {
      toast.error("Failed to fetch vocabulary")
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, type, showArchived])

  useEffect(() => {
    fetchVocab()
  }, [fetchVocab])

  const statCards = [
    {
      label: "Active Items",
      value: stats.totalActive,
      icon: BookOpen,
      accent: "from-emerald-500/15 to-transparent",
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-500/10 border-emerald-500/20",
      border: "border-emerald-500/20",
      valueColor: "text-emerald-100",
    },
    {
      label: "Archived",
      value: stats.totalArchived,
      icon: Archive,
      accent: "from-amber-500/15 to-transparent",
      iconColor: "text-amber-400",
      iconBg: "bg-amber-500/10 border-amber-500/20",
      border: "border-amber-500/20",
      valueColor: "text-amber-100",
    },
    {
      label: "Added This Week",
      value: stats.addedThisWeek,
      icon: Sparkles,
      accent: "from-sky-500/15 to-transparent",
      iconColor: "text-sky-400",
      iconBg: "bg-sky-500/10 border-sky-500/20",
      border: "border-sky-500/20",
      valueColor: "text-sky-100",
    },
  ]

  const filterTypes = [
    { value: "", label: "All" },
    { value: "expression", label: "Expressions" },
    { value: "vocabulary", label: "Vocabulary" },
    { value: "sentence", label: "Sentences" },
  ]

  return (
    <div className="space-y-8">
      <PageHeader
        title="Vocabulary"
        description="All learned items from your listening tasks"
        icon={BookOpen}
        gradient="bg-gradient-to-r from-emerald-600 to-teal-600"
      />

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        {statCards.map((s) => {
          const SIcon = s.icon
          return (
            <div
              key={s.label}
              className={`relative overflow-hidden rounded-2xl border ${s.border} bg-slate-900/80 p-4 backdrop-blur-sm shadow-lg`}
            >
              <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${s.accent}`} />
              <div className="relative flex items-center gap-3">
                <div className={`rounded-xl border p-2.5 ${s.iconBg}`}>
                  <SIcon className={`h-5 w-5 ${s.iconColor}`} />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-slate-500">{s.label}</p>
                  <p className={`text-2xl font-bold tracking-tight ${s.valueColor}`}>{s.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              placeholder="Search vocabulary…"
              className="pl-9 pr-9 h-10 border-slate-700/60 bg-slate-800/60 text-slate-200 placeholder:text-slate-500 focus:border-teal-500/60 focus:ring-teal-500/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button
            variant={showArchived ? "default" : "outline"}
            size="sm"
            onClick={() => setShowArchived(!showArchived)}
            className={`h-10 px-4 font-medium transition-all duration-200 ${
              showArchived
                ? "bg-teal-500 text-slate-950 hover:bg-teal-400 border-transparent"
                : "border-slate-700/60 bg-slate-800/60 text-slate-300 hover:bg-slate-700/60 hover:text-slate-100"
            }`}
          >
            {showArchived ? "Show Active" : "Show Archived"}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {filterTypes.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setType(opt.value)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                type === opt.value
                  ? "border-teal-500/50 bg-teal-500/15 text-teal-300 shadow-sm"
                  : "border-slate-700/50 bg-slate-800/50 text-slate-400 hover:border-slate-600 hover:bg-slate-700/50 hover:text-slate-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Items */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500/60" />
        </div>
      ) : items.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl border border-dashed border-slate-700/60 bg-slate-900/60 py-20 text-center backdrop-blur-sm">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
          <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
            <BookOpen className="h-8 w-8 text-emerald-400/60" />
          </div>
          <h3 className="text-lg font-semibold text-slate-300">No vocabulary items yet</h3>
          <p className="mt-1 text-sm text-slate-500">Items will appear here when you add them from Listening tasks</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <VocabItemCard key={item.id} item={item} onUpdated={fetchVocab} />
          ))}
        </div>
      )}
    </div>
  )
}