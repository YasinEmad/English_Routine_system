"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useDebounce } from "@/hooks/use-debounce"
import Link from "next/link"
import {
  Search,
  Mic,
  CheckCircle2,
  Plus,
  Trash2,
  Edit,
  X,
  Check,
  Loader2,
  CalendarDays,
  AlertCircle,
  Pencil,
  MessageSquare,
  Sparkles,
  Target,
  BookOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { PageHeader } from "@/components/page-header"
import { ConfirmDialog } from "@/components/confirm-dialog"

// ─── Topic Types ────────────────────────────────────────────────────────────

interface Topic {
  id: string
  title: string
  category: string | null
  completed: boolean
  sessionCount: number
  lastPracticed: string | null
}

// ─── Mistake Types ──────────────────────────────────────────────────────────

interface Mistake {
  id: string
  wrongVersion: string
  correctVersion: string
  explanation: string | null
  dateAdded: string
  createdAt: string
}

// ─── Category list ──────────────────────────────────────────────────────────

const defaultCategories = [
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

const getCategoryStyle = (category: string) =>
  categoryStyles[category] ?? {
    bg: "bg-accent/20 dark:bg-accent/30",
    text: "text-foreground",
    border: "border-border/50",
    icon: "text-foreground",
    gradient: "from-slate-500 to-slate-700",
  }

const getCategoryIcon = (category: string) => categoryIcons[category] ?? "🏷️"

// Category color mapping with richer styles
const categoryStyles: Record<string, { bg: string; text: string; border: string; icon: string; gradient: string }> = {
  Technology: {
    bg: "bg-sky-50 dark:bg-sky-950/50",
    text: "text-sky-700 dark:text-sky-400",
    border: "border-sky-200/50 dark:border-sky-800/50",
    icon: "text-sky-500",
    gradient: "from-sky-500 to-blue-600",
  },
  Travel: {
    bg: "bg-emerald-50 dark:bg-emerald-950/50",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-200/50 dark:border-emerald-800/50",
    icon: "text-emerald-500",
    gradient: "from-emerald-500 to-teal-600",
  },
  Work: {
    bg: "bg-violet-50 dark:bg-violet-950/50",
    text: "text-violet-700 dark:text-violet-400",
    border: "border-violet-200/50 dark:border-violet-800/50",
    icon: "text-violet-500",
    gradient: "from-violet-500 to-purple-600",
  },
  Movies: {
    bg: "bg-rose-50 dark:bg-rose-950/50",
    text: "text-rose-700 dark:text-rose-400",
    border: "border-rose-200/50 dark:border-rose-800/50",
    icon: "text-rose-500",
    gradient: "from-rose-500 to-pink-600",
  },
  Education: {
    bg: "bg-amber-50 dark:bg-amber-950/50",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-200/50 dark:border-amber-800/50",
    icon: "text-amber-500",
    gradient: "from-amber-500 to-orange-600",
  },
  "Daily Routine": {
    bg: "bg-teal-50 dark:bg-teal-950/50",
    text: "text-teal-700 dark:text-teal-400",
    border: "border-teal-200/50 dark:border-teal-800/50",
    icon: "text-teal-500",
    gradient: "from-teal-500 to-cyan-600",
  },
  Friendship: {
    bg: "bg-pink-50 dark:bg-pink-950/50",
    text: "text-pink-700 dark:text-pink-400",
    border: "border-pink-200/50 dark:border-pink-800/50",
    icon: "text-pink-500",
    gradient: "from-pink-500 to-rose-600",
  },
  Childhood: {
    bg: "bg-orange-50 dark:bg-orange-950/50",
    text: "text-orange-700 dark:text-orange-400",
    border: "border-orange-200/50 dark:border-orange-800/50",
    icon: "text-orange-500",
    gradient: "from-orange-500 to-red-600",
  },
  Health: {
    bg: "bg-green-50 dark:bg-green-950/50",
    text: "text-green-700 dark:text-green-400",
    border: "border-green-200/50 dark:border-green-800/50",
    icon: "text-green-500",
    gradient: "from-green-500 to-emerald-600",
  },
  Food: {
    bg: "bg-yellow-50 dark:bg-yellow-950/50",
    text: "text-yellow-700 dark:text-yellow-400",
    border: "border-yellow-200/50 dark:border-yellow-800/50",
    icon: "text-yellow-500",
    gradient: "from-yellow-500 to-amber-600",
  },
}

// Category emoji/icon mapping
const categoryIcons: Record<string, string> = {
  Technology: "💻",
  Travel: "✈️",
  Work: "💼",
  Movies: "🎬",
  Education: "📚",
  "Daily Routine": "☀️",
  Friendship: "🤝",
  Childhood: "🧸",
  Health: "💪",
  Food: "🍕",
}

// ═══════════════════════════════════════════════════════════════════════════════
// Add Topic Dialog - self-contained with its own form state
// ═══════════════════════════════════════════════════════════════════════════════

function AddTopicDialog({ open, onOpenChange, onAdded, categories }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdded: () => void
  categories: string[]
}) {
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")

  const addTopic = async () => {
    if (!title.trim()) return
    try {
      await fetch("/api/speaking/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          category: category || null,
        }),
      })
      setTitle("")
      setCategory("")
      onOpenChange(false)
      toast.success("Topic created!")
      onAdded()
    } catch {
      toast.error("Failed to create topic")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="gradient-bg text-white shadow-sm shadow-teal-500/20 hover:shadow-md hover:brightness-110 transition-all duration-200">
          <Plus className="mr-2 h-4 w-4" />Add Topic
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="gradient-text">Add New Topic</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Title</Label>
            <Input
              placeholder="Enter topic title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10"
              onKeyDown={(e) => e.key === "Enter" && addTopic()}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder="Select category (optional)" />
              </SelectTrigger>
              <SelectContent>
                {categories.filter((c) => c !== "All").map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    <span className="flex items-center gap-2">
                      <span>{getCategoryIcon(cat)}</span>
                      <span>{cat}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={addTopic} className="w-full gradient-bg text-white shadow-sm">
            Create Topic
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function CategoryManagerDialog({
  open,
  onOpenChange,
  categories,
  onAddCategory,
  onDeleteCategory,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: string[]
  onAddCategory: (name: string) => void
  onDeleteCategory: (name: string) => void
}) {
  const [newCategory, setNewCategory] = useState("")

  const handleAdd = () => {
    onAddCategory(newCategory)
    setNewCategory("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="gradient-text">Manage Categories</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">New category</Label>
            <div className="flex gap-2">
              <Input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder="Add a new category"
                className="h-10"
              />
              <Button onClick={handleAdd} className="h-10">Add</Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Existing categories</Label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <div
                  key={cat}
                  className="flex items-center gap-2 rounded-full border border-border/50 bg-background/80 px-3 py-1 text-xs"
                >
                  <span>{cat === "All" ? "📌" : getCategoryIcon(cat)}</span>
                  <span>{cat}</span>
                  {cat !== "All" && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => onDeleteCategory(cat)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Deleting a category will unset it from any existing topics.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Mistake Form - manages its own state to prevent parent re-renders on typing
// ═══════════════════════════════════════════════════════════════════════════════

function MistakeFormFields({ formData, setFormData }: {
  formData: { wrongVersion: string; correctVersion: string; explanation: string; dateAdded: string }
  setFormData: React.Dispatch<React.SetStateAction<{ wrongVersion: string; correctVersion: string; explanation: string; dateAdded: string }>>
}) {
  return (
    <div className="space-y-4 pt-2">
      <div className="space-y-2">
        <Label className="text-xs font-medium uppercase tracking-wider text-destructive/80">Wrong Version</Label>
        <Textarea
          placeholder="What you said wrong..."
          value={formData.wrongVersion}
          onChange={(e) => setFormData({ ...formData, wrongVersion: e.target.value })}
          rows={2}
          className="border-destructive/20 focus:border-destructive/40 focus:ring-2 focus:ring-destructive/10"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Correct Version</Label>
        <Textarea
          placeholder="The correct way to say it..."
          value={formData.correctVersion}
          onChange={(e) => setFormData({ ...formData, correctVersion: e.target.value })}
          rows={2}
          className="border-emerald-200/50 dark:border-emerald-800/50 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-500/10"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Explanation (optional)</Label>
        <Textarea
          placeholder="Why this is wrong..."
          value={formData.explanation}
          onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
          rows={2}
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Date</Label>
        <Input
          type="date"
          value={formData.dateAdded}
          onChange={(e) => setFormData({ ...formData, dateAdded: e.target.value })}
        />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Add Mistake Dialog - self-contained with its own form state
// ═══════════════════════════════════════════════════════════════════════════════

function AddMistakeDialog({ open, onOpenChange, onAdded }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdded: () => void
}) {
  const emptyForm = {
    wrongVersion: "",
    correctVersion: "",
    explanation: "",
    dateAdded: new Date().toISOString().split("T")[0],
  }
  const [formData, setFormData] = useState(emptyForm)

  const addMistake = async () => {
    try {
      await fetch("/api/speaking/mistakes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      setFormData(emptyForm)
      onOpenChange(false)
      toast.success("Mistake added!")
      onAdded()
    } catch {
      toast.error("Failed to add mistake")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="gradient-bg text-white shadow-sm shadow-teal-500/20 hover:shadow-md hover:brightness-110 transition-all duration-200">
          <Plus className="mr-2 h-4 w-4" />Add Mistake
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="gradient-text">Add New Mistake</DialogTitle>
        </DialogHeader>
        <MistakeFormFields formData={formData} setFormData={setFormData} />
        <Button onClick={addMistake} className="w-full mt-4 gradient-bg text-white shadow-sm">
          Save Mistake
        </Button>
      </DialogContent>
    </Dialog>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Edit Mistake Form - inline editing with its own state
// ═══════════════════════════════════════════════════════════════════════════════

function EditMistakeForm({ mistake, onSave, onCancel }: {
  mistake: Mistake
  onSave: () => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    wrongVersion: mistake.wrongVersion,
    correctVersion: mistake.correctVersion,
    explanation: mistake.explanation || "",
    dateAdded: mistake.dateAdded,
  })

  const updateMistake = async () => {
    try {
      await fetch(`/api/speaking/mistakes/${mistake.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      toast.success("Mistake updated!")
      onSave()
    } catch {
      toast.error("Failed to update mistake")
    }
  }

  return (
    <div className="p-5 space-y-3">
      <MistakeFormFields formData={formData} setFormData={setFormData} />
      <div className="flex gap-2">
        <Button size="sm" onClick={updateMistake} className="gradient-bg text-white">Save</Button>
        <Button size="sm" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Speaking Page
// ═══════════════════════════════════════════════════════════════════════════════

export default function SpeakingPage() {
  const [activeTab, setActiveTab] = useState("topics")

  return (
    <div className="space-y-6">
      <PageHeader
        title="Speaking"
        description="Practice topics and track your mistakes"
        icon={Mic}
        gradient="bg-gradient-to-r from-sky-600 to-blue-600"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50 p-1 rounded-lg">
          <TabsTrigger
            value="topics"
            className="flex-1 sm:flex-none gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:rounded-md transition-all duration-200"
          >
            <Mic className="h-4 w-4" />Topics
          </TabsTrigger>
          <TabsTrigger
            value="mistakes"
            className="flex-1 sm:flex-none gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:rounded-md transition-all duration-200"
          >
            <AlertCircle className="h-4 w-4" />My Mistakes
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === "topics" ? <TopicsSection /> : <MistakesSection />}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Topics Section
// ═══════════════════════════════════════════════════════════════════════════════

function TopicsSection() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search)
  const [category, setCategory] = useState("All")
  const [categoryList, setCategoryList] = useState<string[]>(defaultCategories)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [deleteTargetTitle, setDeleteTargetTitle] = useState("")

  const fetchTopics = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (debouncedSearch) params.set("search", debouncedSearch)
      if (category && category !== "All") params.set("category", category)
      const res = await fetch(`/api/speaking/topics?${params}`)
      const data = await res.json()
      setTopics(data)
    } catch {
      // error
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, category])

  useEffect(() => {
    fetchTopics()
  }, [fetchTopics])

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("speakingCategories") : null
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.every((item) => typeof item === "string")) {
          setCategoryList(parsed.includes("All") ? parsed : ["All", ...parsed])
        }
      } catch {
        // ignore invalid storage
      }
    }
  }, [])

  useEffect(() => {
    const handler = () => fetchTopics()
    window.addEventListener("topics-updated", handler)
    return () => window.removeEventListener("topics-updated", handler)
  }, [fetchTopics])

  const saveCategoryList = (list: string[]) => {
    setCategoryList(list)
    if (typeof window !== "undefined") {
      window.localStorage.setItem("speakingCategories", JSON.stringify(list))
    }
  }

  const addCategory = (name: string) => {
    const trimmed = name.trim()
    if (!trimmed) {
      toast.error("Category name cannot be empty")
      return
    }
    if (categoryList.includes(trimmed)) {
      toast.error("This category already exists")
      return
    }
    saveCategoryList([...categoryList, trimmed])
    toast.success("Category added")
  }

  const deleteCategory = async (name: string) => {
    if (name === "All") {
      toast.error("Cannot delete the All filter")
      return
    }
    const updatedCategories = categoryList.filter((cat) => cat !== name)
    saveCategoryList(updatedCategories)
    if (category === name) setCategory("All")

    const topicsToClear = topics.filter((topic) => topic.category === name)
    await Promise.all(
      topicsToClear.map((topic) =>
        fetch(`/api/speaking/topics/${topic.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category: null }),
        })
      )
    )
    toast.success(`Category "${name}" deleted`)
    fetchTopics()
  }

  const deleteTopic = async (id: string) => {
    try {
      await fetch(`/api/speaking/topics/${id}`, { method: "DELETE" })
      setDeleteConfirmOpen(false)
      setDeleteTargetId(null)
      setDeleteTargetTitle("")
      toast.success("Topic deleted")
      fetchTopics()
    } catch {
      toast.error("Failed to delete topic")
    }
  }

  const openDeleteConfirm = (e: React.MouseEvent, topic: Topic) => {
    e.preventDefault()
    e.stopPropagation()
    setDeleteTargetId(topic.id)
    setDeleteTargetTitle(topic.title)
    setDeleteConfirmOpen(true)
  }

  // Stats for mini-bar
  const totalTopics = topics.length
  const completedTopics = topics.filter((t) => t.completed).length
  const completionRate = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0

  return (
    <div className="space-y-5">
      {/* Search + Add Topic */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
          <Input
            placeholder="Search topics..."
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
        <div className="flex flex-wrap gap-2">
          <AddTopicDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} onAdded={fetchTopics} categories={categoryList} />
          <Button
            variant="outline"
            className="h-10"
            onClick={() => setCategoryManagerOpen(true)}
          >
            <BookOpen className="mr-2 h-4 w-4" />Manage Categories
          </Button>
        </div>
      </div>

      {/* Mini Stats Bar */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-4 rounded-lg bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5 text-teal-500" />
            <span className="font-semibold text-foreground">{totalTopics}</span> topics
          </span>
          <span className="h-3 w-px bg-border" />
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span className="font-semibold text-foreground">{completedTopics}</span> done
          </span>
          <span className="h-3 w-px bg-border" />
          <span className="flex items-center gap-1.5">
            <span className="font-semibold text-foreground">{completionRate}%</span> complete
          </span>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-1.5">
        {categoryList.map((cat) => (
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
            {cat !== "All" && <span className="mr-1">{getCategoryIcon(cat)}</span>}
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : topics.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50 dark:bg-sky-950/50">
              <Mic className="h-8 w-8 text-sky-500/60" />
            </div>
            <h3 className="text-lg font-semibold">No topics found</h3>
            <p className="text-sm text-muted-foreground mt-1">Create a new topic or adjust your filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
          {topics.map((topic) => (
            <TopicCard key={topic.id} topic={topic} onDelete={openDeleteConfirm} categories={categoryList} />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Topic?"
        description={`"${deleteTargetTitle}" and all its practice sessions will be permanently removed.`}
        onConfirm={() => deleteTargetId && deleteTopic(deleteTargetId)}
      />
      <CategoryManagerDialog
        open={categoryManagerOpen}
        onOpenChange={setCategoryManagerOpen}
        categories={categoryList}
        onAddCategory={addCategory}
        onDeleteCategory={deleteCategory}
      />
    </div>
  )
}

// ─── Topic Card with edit + delete ──────────────────────────────────────────

function TopicCard({ topic, onDelete, categories }: { topic: Topic; onDelete: (e: React.MouseEvent, topic: Topic) => void; categories: string[] }) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editTitle, setEditTitle] = useState("")
  const [editCategory, setEditCategory] = useState("")

  const openEditDialog = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setEditTitle(topic.title)
    setEditCategory(topic.category || "")
    setEditDialogOpen(true)
  }

  const saveTopicEdit = async () => {
    if (!editTitle.trim()) return
    try {
      await fetch(`/api/speaking/topics/${topic.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim(),
          category: editCategory || null,
        }),
      })
      setEditDialogOpen(false)
      toast.success("Topic updated!")
      window.dispatchEvent(new CustomEvent("topics-updated"))
    } catch {
      toast.error("Failed to update topic")
    }
  }

  const catStyle = topic.category ? getCategoryStyle(topic.category) : null

  return (
    <>
      <Link href={`/speaking/topics/${topic.id}`}>
        <Card className={`group cursor-pointer transition-all duration-200 h-full overflow-hidden card-hover-lift ${topic.completed ? "opacity-70" : ""}`}>
          {/* Category color strip at top */}
          {catStyle && (
            <div className={`h-1 w-full bg-gradient-to-r ${catStyle.gradient}`} />
          )}
          {!catStyle && (
            <div className="h-1 w-full bg-gradient-to-r from-muted/50 to-muted/30" />
          )}
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-2 mb-3">
              <h3 className={`font-medium leading-snug group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors duration-200 ${topic.completed ? "line-through decoration-muted-foreground/30" : ""}`}>
                {topic.title}
              </h3>
              <div className="flex items-center gap-0.5 shrink-0">
                {topic.completed && (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-muted-foreground hover:text-teal-600 dark:hover:text-teal-400"
                  onClick={openEditDialog}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-muted-foreground hover:text-destructive"
                  onClick={(e) => onDelete(e, topic)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {topic.category ? (
                <Badge
                  className={`text-[10px] uppercase tracking-wider border cursor-pointer hover:brightness-95 transition-all duration-200 ${catStyle?.bg || "bg-accent/50"} ${catStyle?.text || ""} ${catStyle?.border || "border-border/50"}`}
                  onClick={openEditDialog}
                >
                  <span className="mr-1">{getCategoryIcon(topic.category)}</span>
                  {topic.category}
                </Badge>
              ) : (
                <button
                  onClick={openEditDialog}
                  className="text-[10px] uppercase tracking-wider text-muted-foreground/50 hover:text-muted-foreground border border-dashed border-border/50 rounded-md px-2 py-0.5 transition-colors duration-200"
                >
                  + Add category
                </button>
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

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="gradient-text">Edit Topic</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Title</Label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Topic title..."
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Category</Label>
              <Select value={editCategory} onValueChange={setEditCategory}>
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter((c) => c !== "All").map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      <span className="flex items-center gap-2">
                        <span>{getCategoryIcon(cat)}</span>
                        <span>{cat}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={saveTopicEdit} className="w-full gradient-bg text-white shadow-sm">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Mistakes Section
// ═══════════════════════════════════════════════════════════════════════════════

function MistakesSection() {
  const [mistakes, setMistakes] = useState<Mistake[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search)
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  const fetchMistakes = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (debouncedSearch) params.set("search", debouncedSearch)
      if (dateFrom) params.set("dateFrom", dateFrom)
      if (dateTo) params.set("dateTo", dateTo)
      const res = await fetch(`/api/speaking/mistakes?${params}`)
      const data = await res.json()
      setMistakes(data)
    } catch {
      toast.error("Failed to fetch mistakes")
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, dateFrom, dateTo])

  useEffect(() => {
    fetchMistakes()
  }, [fetchMistakes])

  const deleteMistake = async (id: string) => {
    try {
      await fetch(`/api/speaking/mistakes/${id}`, { method: "DELETE" })
      setDeleteConfirmOpen(false)
      setDeleteTargetId(null)
      toast.success("Mistake deleted")
      fetchMistakes()
    } catch {
      toast.error("Failed to delete mistake")
    }
  }

  return (
    <div className="space-y-5">
      {/* Add Mistake Button + Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <AddMistakeDialog open={dialogOpen} onOpenChange={setDialogOpen} onAdded={fetchMistakes} />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
            <Input
              placeholder="Search mistakes..."
              className="pl-9 pr-9 w-full sm:w-56 h-9 bg-background/50 border-muted-foreground/15"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors duration-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full sm:w-36 h-9 bg-background/50 border-muted-foreground/15"
            placeholder="From"
          />
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full sm:w-36 h-9 bg-background/50 border-muted-foreground/15"
            placeholder="To"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : mistakes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/50">
              <AlertCircle className="h-8 w-8 text-amber-500/60" />
            </div>
            <h3 className="text-lg font-semibold">No mistakes yet</h3>
            <p className="text-sm text-muted-foreground mt-1">Start logging your speaking mistakes to learn from them</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 stagger-children">
          {mistakes.map((mistake) => (
            <Card key={mistake.id} className="overflow-hidden transition-all duration-200 hover:shadow-sm">
              <CardContent className="p-0">
                {editId === mistake.id ? (
                  <EditMistakeForm
                    mistake={mistake}
                    onSave={() => { setEditId(null); fetchMistakes() }}
                    onCancel={() => setEditId(null)}
                  />
                ) : (
                  <div className="flex">
                    {/* Left colored border indicators */}
                    <div className="flex flex-col w-1.5 shrink-0">
                      <div className="flex-1 bg-destructive/40" />
                      <div className="flex-1 bg-emerald-500/40" />
                    </div>
                    <div className="flex-1 p-5 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-3">
                          {/* Wrong version */}
                          <div className="flex items-start gap-2.5">
                            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                              <X className="h-3 w-3 text-destructive" />
                            </div>
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-widest text-destructive/80 mb-0.5">Wrong</p>
                              <p className="text-sm">{mistake.wrongVersion}</p>
                            </div>
                          </div>
                          {/* Correct version */}
                          <div className="flex items-start gap-2.5">
                            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                              <Check className="h-3 w-3 text-emerald-500" />
                            </div>
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-600/80 dark:text-emerald-400/80 mb-0.5">Correct</p>
                              <p className="text-sm">{mistake.correctVersion}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button size="icon" variant="ghost" className="h-7 w-7 hover:bg-accent transition-colors duration-200" onClick={() => setEditId(mistake.id)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive transition-colors duration-200" onClick={() => { setDeleteTargetId(mistake.id); setDeleteConfirmOpen(true) }}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      {mistake.explanation && (
                        <div className="flex items-start gap-2 pl-7.5">
                          <MessageSquare className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground/50" />
                          <p className="text-sm text-muted-foreground bg-accent/30 rounded-md px-3 py-1.5 flex-1">{mistake.explanation}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70 pl-7.5">
                        <CalendarDays className="h-3 w-3" />
                        {mistake.dateAdded}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Mistake?"
        description="This mistake entry will be permanently removed from your records."
        onConfirm={() => deleteTargetId && deleteMistake(deleteTargetId)}
      />
    </div>
  )
}
