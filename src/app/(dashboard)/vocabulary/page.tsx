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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
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
  examples: string  // JSON string, e.g. '["example 1", "example 2"]'
  status: string
  createdAt: string
  task: TaskRef
}

interface VocabStats {
  totalActive: number
  totalArchived: number
  addedThisWeek: number
}

const typeConfig: Record<string, { color: string; icon: typeof BookOpen; bg: string }> = {
  expression: {
    color: "bg-amber-50 text-amber-700 border-amber-200/50 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800/50",
    icon: MessageSquareQuote,
    bg: "bg-amber-500/40",
  },
  vocabulary: {
    color: "bg-emerald-50 text-emerald-700 border-emerald-200/50 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/50",
    icon: BookMarked,
    bg: "bg-emerald-500/40",
  },
  sentence: {
    color: "bg-sky-50 text-sky-700 border-sky-200/50 dark:bg-sky-950/50 dark:text-sky-400 dark:border-sky-800/50",
    icon: AlignLeft,
    bg: "bg-sky-500/40",
  },
}

// ═══════════════════════════════════════════════════════════════════════════════
// Vocab Item Card - with inline edit and improved display
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

  const startEdit = () => {
    setEditContent(item.content)
    setEditType(item.itemType)
    let parsed: string[] = []
    try { parsed = JSON.parse(item.examples || "[]") } catch { /* ignore */ }
    setEditEx1(parsed[0] || "")
    setEditEx2(parsed[1] || "")
    setEditing(true)
  }

  const saveEdit = async () => {
    if (!editContent.trim()) return
    const examples: string[] = []
    if (editEx1.trim()) examples.push(editEx1.trim())
    if (editEx2.trim()) examples.push(editEx2.trim())

    // Find the task ID from the item - we need to use the vocabulary API
    try {
      await fetch(`/api/vocabulary/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: editContent.trim(),
          itemType: editType,
          examples,
        }),
      })
      setEditing(false)
      toast.success("Item updated!")
      onUpdated()
    } catch {
      toast.error("Failed to update item")
    }
  }

  const cancelEdit = () => {
    setEditing(false)
  }

  const updateStatus = async (status: string) => {
    try {
      await fetch(`/api/vocabulary/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      toast.success(status === "archived" ? "Item archived" : status === "active" ? "Item restored" : "Item removed")
      onUpdated()
    } catch {
      toast.error("Failed to update item")
    }
  }

  const config = typeConfig[item.itemType]
  const Icon = config?.icon || BookOpen

  // Parse examples
  let parsedExamples: string[] = []
  try { parsedExamples = JSON.parse(item.examples || "[]") } catch { /* ignore */ }

  if (editing) {
    return (
      <Card className="overflow-hidden border-teal-200/50 dark:border-teal-800/50">
        <CardContent className="p-0">
          <div className="flex items-stretch">
            <div className={`w-1.5 shrink-0 ${config?.bg || "bg-muted/40"}`} />
            <div className="flex-1 p-4 space-y-2.5 animate-slide-down">
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Word/expression/sentence"
                  className="flex-1 h-8 text-sm"
                  onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                />
                <Select value={editType} onValueChange={setEditType}>
                  <SelectTrigger className="w-[130px] h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vocabulary">Vocabulary</SelectItem>
                    <SelectItem value="expression">Expression</SelectItem>
                    <SelectItem value="sentence">Sentence</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  value={editEx1}
                  onChange={(e) => setEditEx1(e.target.value)}
                  placeholder="Example 1 (optional)"
                  className="flex-1 h-8 text-sm"
                />
                <Input
                  value={editEx2}
                  onChange={(e) => setEditEx2(e.target.value)}
                  placeholder="Example 2 (optional)"
                  className="flex-1 h-8 text-sm"
                />
              </div>
              <div className="flex gap-1.5">
                <Button size="sm" onClick={saveEdit} className="h-7 text-xs gradient-bg text-white">
                  <Check className="mr-1 h-3 w-3" />Save
                </Button>
                <Button size="sm" variant="outline" onClick={cancelEdit} className="h-7 text-xs">Cancel</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-sm group overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-stretch">
          {/* Type color indicator */}
          <div className={`w-1.5 shrink-0 ${
            item.itemType === "vocabulary" ? "bg-emerald-500/40" :
            item.itemType === "expression" ? "bg-amber-500/40" :
            "bg-sky-500/40"
          }`} />
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={`text-[10px] uppercase tracking-wider border gap-1 ${config?.color || "bg-accent/50 border-border/50"}`}>
                    <Icon className="h-3 w-3" />
                    {item.itemType}
                  </Badge>
                  <span className="font-medium">{item.content}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] uppercase tracking-wider ${
                      item.status === "active"
                        ? "text-emerald-600 border-emerald-200/50 dark:text-emerald-400 dark:border-emerald-800/50"
                        : "text-amber-600 border-amber-200/50 dark:text-amber-400 dark:border-amber-800/50"
                    }`}
                  >
                    {item.status}
                  </Badge>
                </div>
                {parsedExamples.length > 0 && (
                  <div className="space-y-1 pl-1">
                    {parsedExamples.map((ex, i) => (
                      <p key={i} className="text-xs text-muted-foreground italic flex items-start gap-1.5">
                        <MessageSquareQuote className="h-3 w-3 shrink-0 mt-0.5 text-teal-500/50" />
                        <span>{ex}</span>
                      </p>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <a
                    href={item.task.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 hover:underline text-teal-600 dark:text-teal-400 transition-colors duration-200"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Source
                  </a>
                  <span className="text-muted-foreground/60">Added: {new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 text-muted-foreground hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-200"
                  onClick={startEdit}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                {item.status === "active" ? (
                  <Button size="sm" variant="ghost" onClick={() => updateStatus("archived")} className="h-7 w-7 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950 dark:hover:text-amber-400 transition-colors duration-200">
                    <Archive className="h-3.5 w-3.5" />
                  </Button>
                ) : (
                  <Button size="sm" variant="ghost" onClick={() => updateStatus("active")} className="h-7 w-7 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950 dark:hover:text-emerald-400 transition-colors duration-200">
                    <RotateCcw className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button size="sm" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive transition-colors duration-200" onClick={() => updateStatus("removed")}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
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

  return (
    <div className="space-y-8">
      <PageHeader
        title="Vocabulary"
        description="All learned items from your listening tasks"
        icon={BookOpen}
        gradient="bg-gradient-to-r from-emerald-600 to-teal-600"
      />

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-3 stagger-children">
        <Card className="border-l-emerald">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-2.5 dark:from-emerald-950 dark:to-emerald-900/30">
              <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Active Items</p>
              <p className="text-2xl font-bold tracking-tight">{stats.totalActive}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-amber">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 p-2.5 dark:from-amber-950 dark:to-amber-900/30">
              <Archive className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Archived Items</p>
              <p className="text-2xl font-bold tracking-tight">{stats.totalArchived}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-sky">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-sky-50 to-sky-100/50 p-2.5 dark:from-sky-950 dark:to-sky-900/30">
              <Sparkles className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Added This Week</p>
              <p className="text-2xl font-bold tracking-tight">{stats.addedThisWeek}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
            <Input
              placeholder="Search vocabulary..."
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
          <Button
            variant={showArchived ? "default" : "outline"}
            size="sm"
            onClick={() => setShowArchived(!showArchived)}
            className={`h-10 transition-all duration-200 ${showArchived ? "gradient-bg text-white shadow-sm" : "hover:bg-accent"}`}
          >
            {showArchived ? "Show Active" : "Show Archived"}
          </Button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {[
            { value: "", label: "All" },
            { value: "expression", label: "Expressions" },
            { value: "vocabulary", label: "Vocabulary" },
            { value: "sentence", label: "Sentences" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setType(opt.value)}
              className={`
                rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 border
                ${type === opt.value
                  ? "gradient-bg text-white border-transparent shadow-sm shadow-teal-500/20"
                  : "bg-accent/50 text-muted-foreground border-border/50 hover:bg-accent hover:text-foreground"
                }
              `}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/50">
              <BookOpen className="h-8 w-8 text-emerald-500/60" />
            </div>
            <h3 className="text-lg font-semibold">No vocabulary items yet</h3>
            <p className="text-sm text-muted-foreground mt-1">Items will appear here when you add them from Listening tasks</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2 stagger-children">
          {items.map((item) => (
            <VocabItemCard key={item.id} item={item} onUpdated={fetchVocab} />
          ))}
        </div>
      )}
    </div>
  )
}
