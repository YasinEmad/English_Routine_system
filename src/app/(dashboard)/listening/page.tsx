"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { format } from "date-fns"
import {
  Plus,
  Check,
  Trash2,
  ExternalLink,
  Clock,
  CalendarDays,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Loader2,
  Headphones,
  CircleDot,
  Pencil,
  X,
  Youtube,
  Sparkles,
  MessageSquareQuote,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { PageHeader } from "@/components/page-header"
import { ConfirmDialog } from "@/components/confirm-dialog"

interface LearnedItem {
  id: string
  content: string
  itemType: string
  examples: string  // JSON string, e.g. '["example 1", "example 2"]'
  status: string
  createdAt: string
}

interface ListeningTask {
  id: string
  videoUrl: string
  durationMin: number
  scheduledFor: string
  completed: boolean
  completedAt: string | null
  createdAt: string
  learnedItems: LearnedItem[]
}

// ═══════════════════════════════════════════════════════════════════════════════
// Create Task Dialog - manages its own form state to prevent parent re-renders
// ═══════════════════════════════════════════════════════════════════════════════

function CreateTaskDialog({ open, onOpenChange, onCreated }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}) {
  const [formData, setFormData] = useState({
    videoUrl: "",
    durationMin: 30,
    scheduledFor: new Date().toISOString().split("T")[0],
  })

  const createTask = async () => {
    try {
      await fetch("/api/listening/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      setFormData({
        videoUrl: "",
        durationMin: 30,
        scheduledFor: new Date().toISOString().split("T")[0],
      })
      onOpenChange(false)
      toast.success("Task created!")
      onCreated()
    } catch {
      toast.error("Failed to create task")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200">
          <Plus className="mr-2 h-4 w-4" />Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="gradient-text text-lg">Create Listening Task</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">YouTube Video URL</Label>
            <Input
              placeholder="https://www.youtube.com/watch?v=..."
              value={formData.videoUrl}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Duration (minutes)</Label>
            <Input
              type="number"
              min={1}
              value={formData.durationMin}
              onChange={(e) => setFormData({ ...formData, durationMin: parseInt(e.target.value) || 0 })}
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Scheduled Date</Label>
            <Input
              type="date"
              value={formData.scheduledFor}
              onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
              className="h-10"
            />
          </div>
          <Button onClick={createTask} className="w-full gradient-bg text-white shadow-sm">
            Create Task
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Add Item Inline Form - manages its own input state to prevent parent re-renders
// ═══════════════════════════════════════════════════════════════════════════════

function AddItemInline({ taskId, onAdded }: { taskId: string; onAdded: () => void }) {
  const contentRef = useRef<HTMLInputElement>(null)
  const example1Ref = useRef<HTMLInputElement>(null)
  const example2Ref = useRef<HTMLInputElement>(null)
  const [itemType, setItemType] = useState("vocabulary")
  const [showExamples, setShowExamples] = useState(false)

  const addItem = async () => {
    const content = contentRef.current?.value.trim()
    if (!content) return

    const examples: string[] = []
    const ex1 = example1Ref.current?.value.trim()
    const ex2 = example2Ref.current?.value.trim()
    if (ex1) examples.push(ex1)
    if (ex2) examples.push(ex2)

    try {
      await fetch(`/api/listening/tasks/${taskId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ content, itemType, examples }],
        }),
      })
      if (contentRef.current) contentRef.current.value = ""
      if (example1Ref.current) example1Ref.current.value = ""
      if (example2Ref.current) example2Ref.current.value = ""
      setItemType("vocabulary")
      setShowExamples(false)
      toast.success("Item added!")
      onAdded()
    } catch {
      toast.error("Failed to add item")
    }
  }

  return (
    <div className="mt-3 space-y-2 animate-slide-down">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          ref={contentRef}
          placeholder="Enter word/expression/sentence"
          className="flex-1 h-9"
          onKeyDown={(e) => e.key === "Enter" && addItem()}
        />
        <Select value={itemType} onValueChange={setItemType}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="vocabulary">Vocabulary</SelectItem>
            <SelectItem value="expression">Expression</SelectItem>
            <SelectItem value="sentence">Sentence</SelectItem>
          </SelectContent>
        </Select>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowExamples(!showExamples)}
          className={`h-9 gap-1.5 transition-colors duration-200 ${showExamples ? "bg-teal-50 text-teal-700 border-teal-300 dark:bg-teal-950 dark:text-teal-400 dark:border-teal-800" : ""}`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          Examples
        </Button>
        <Button size="sm" onClick={addItem} className="h-9 gradient-bg text-white shadow-sm">
          <Plus className="mr-1 h-3.5 w-3.5" />Add
        </Button>
      </div>
      {showExamples && (
        <div className="flex flex-col gap-2 sm:flex-row animate-slide-down">
          <Input
            ref={example1Ref}
            placeholder="Example 1 (optional)"
            className="flex-1 h-9 text-sm"
            onKeyDown={(e) => e.key === "Enter" && addItem()}
          />
          <Input
            ref={example2Ref}
            placeholder="Example 2 (optional)"
            className="flex-1 h-9 text-sm"
            onKeyDown={(e) => e.key === "Enter" && addItem()}
          />
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Learned Item Row - display with edit/delete, manages its own edit state
// ═══════════════════════════════════════════════════════════════════════════════

const itemTypeStyles: Record<string, { color: string; icon: typeof BookOpen; label: string }> = {
  expression: {
    color: "bg-amber-50 text-amber-700 border-amber-200/50 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800/50",
    icon: MessageSquareQuote,
    label: "Expression",
  },
  vocabulary: {
    color: "bg-emerald-50 text-emerald-700 border-emerald-200/50 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/50",
    icon: BookOpen,
    label: "Vocabulary",
  },
  sentence: {
    color: "bg-sky-50 text-sky-700 border-sky-200/50 dark:bg-sky-950/50 dark:text-sky-400 dark:border-sky-800/50",
    icon: Sparkles,
    label: "Sentence",
  },
}

function LearnedItemRow({ item, taskId, onUpdated, onDeleteConfirm }: {
  item: LearnedItem
  taskId: string
  onUpdated: () => void
  onDeleteConfirm: (itemId: string, itemContent: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(item.content)
  const [editType, setEditType] = useState(item.itemType)
  const [editEx1, setEditEx1] = useState("")
  const [editEx2, setEditEx2] = useState("")

  const typeBadgeLocal = (type: string) => {
    const config = itemTypeStyles[type]
    const Icon = config?.icon || BookOpen
    return (
      <Badge className={`border text-[10px] uppercase tracking-wider gap-1 ${config?.color || ""}`}>
        <Icon className="h-3 w-3" />
        {type}
      </Badge>
    )
  }

  const startEdit = () => {
    setEditContent(item.content)
    setEditType(item.itemType)
    let parsedExamples: string[] = []
    try { parsedExamples = JSON.parse(item.examples || "[]") } catch { /* ignore */ }
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
      await fetch(`/api/listening/tasks/${taskId}/items/${item.id}`, {
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

  // Parse examples for display
  let parsedExamples: string[] = []
  try { parsedExamples = JSON.parse(item.examples || "[]") } catch { /* ignore */ }

  if (editing) {
    return (
      <div className="rounded-lg border border-teal-200/50 dark:border-teal-800/50 bg-teal-50/30 dark:bg-teal-950/20 px-3 py-2.5 space-y-2 animate-slide-down">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            placeholder="Word/expression/sentence"
            className="flex-1 h-8 text-sm"
            onKeyDown={(e) => e.key === "Enter" && saveEdit()}
          />
          <Select value={editType} onValueChange={setEditType}>
            <SelectTrigger className="w-[120px] h-8 text-sm">
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
            onKeyDown={(e) => e.key === "Enter" && saveEdit()}
          />
          <Input
            value={editEx2}
            onChange={(e) => setEditEx2(e.target.value)}
            placeholder="Example 2 (optional)"
            className="flex-1 h-8 text-sm"
            onKeyDown={(e) => e.key === "Enter" && saveEdit()}
          />
        </div>
        <div className="flex gap-1.5">
          <Button size="sm" onClick={saveEdit} className="h-7 text-xs gradient-bg text-white">Save</Button>
          <Button size="sm" variant="outline" onClick={cancelEdit} className="h-7 text-xs">Cancel</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg bg-accent/40 px-3 py-2 group/item transition-colors duration-200 hover:bg-accent/60">
      <div className="flex items-center gap-1.5 flex-wrap">
        {typeBadgeLocal(item.itemType)}
        <span className="text-sm font-medium">{item.content}</span>
        <div className="flex items-center gap-0.5 ml-auto opacity-0 group-hover/item:opacity-100 transition-opacity duration-200">
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-muted-foreground hover:text-teal-600 dark:hover:text-teal-400"
            onClick={(e) => { e.stopPropagation(); startEdit() }}
          >
            <Pencil className="h-2.5 w-2.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-muted-foreground hover:text-destructive"
            onClick={(e) => { e.stopPropagation(); onDeleteConfirm(item.id, item.content) }}
          >
            <Trash2 className="h-2.5 w-2.5" />
          </Button>
        </div>
      </div>
      {parsedExamples.length > 0 && (
        <div className="mt-1.5 space-y-1 pl-1">
          {parsedExamples.map((ex, i) => (
            <p key={i} className="text-xs text-muted-foreground italic flex items-start gap-1.5">
              <MessageSquareQuote className="h-3 w-3 shrink-0 mt-0.5 text-teal-500/50" />
              <span>{ex}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Listening Page
// ═══════════════════════════════════════════════════════════════════════════════

export default function ListeningPage() {
  const [tasks, setTasks] = useState<ListeningTask[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [expandedTask, setExpandedTask] = useState<string | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [deleteItemConfirmOpen, setDeleteItemConfirmOpen] = useState(false)
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null)
  const [deleteItemContent, setDeleteItemContent] = useState("")
  const [deleteItemTaskId, setDeleteItemTaskId] = useState<string | null>(null)

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/listening/tasks")
      const data = await res.json()
      setTasks(data)
    } catch {
      toast.error("Failed to fetch tasks")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const markComplete = async (id: string) => {
    try {
      await fetch(`/api/listening/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true }),
      })
      toast.success("Task completed!")
      fetchTasks()
    } catch {
      toast.error("Failed to update task")
    }
  }

  const deleteTask = async (id: string) => {
    try {
      await fetch(`/api/listening/tasks/${id}`, { method: "DELETE" })
      setDeleteConfirmOpen(false)
      setDeleteTargetId(null)
      toast.success("Task deleted")
      fetchTasks()
    } catch {
      toast.error("Failed to delete task")
    }
  }

  const openDeleteConfirm = (id: string) => {
    setDeleteTargetId(id)
    setDeleteConfirmOpen(true)
  }

  const openItemDeleteConfirm = (itemId: string, content: string) => {
    // Find which task this item belongs to
    const task = tasks.find((t) => t.learnedItems.some((li) => li.id === itemId))
    setDeleteItemId(itemId)
    setDeleteItemContent(content)
    setDeleteItemTaskId(task?.id || null)
    setDeleteItemConfirmOpen(true)
  }

  const deleteItem = async () => {
    if (!deleteItemId || !deleteItemTaskId) return
    try {
      await fetch(`/api/listening/tasks/${deleteItemTaskId}/items/${deleteItemId}`, { method: "DELETE" })
      setDeleteItemConfirmOpen(false)
      setDeleteItemId(null)
      setDeleteItemContent("")
      setDeleteItemTaskId(null)
      toast.success("Item deleted")
      fetchTasks()
    } catch {
      toast.error("Failed to delete item")
    }
  }

  const today = new Date().toISOString().split("T")[0]
  const todayTasks = tasks.filter((t) => t.scheduledFor === today)
  const todayCompleted = todayTasks.filter((t) => t.completed).length
  const todayItems = tasks
    .filter((t) => t.scheduledFor === today)
    .reduce((acc, t) => acc + t.learnedItems.length, 0)

  const futureTasks = tasks.filter((t) => t.scheduledFor > today && !t.completed)
  const completedTasks = tasks.filter((t) => t.completed)

  const statusBadge = (completed: boolean) => {
    if (completed) return (
      <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200/50 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/50">
        <Check className="mr-1 h-3 w-3" />
        Completed
      </Badge>
    )
    return (
      <Badge variant="secondary" className="bg-amber-50 text-amber-700 border border-amber-200/50 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800/50">
        <CircleDot className="mr-1 h-3 w-3" />
        Pending
      </Badge>
    )
  }

  const TaskCard = ({ task }: { task: ListeningTask }) => {
    const isToday = task.scheduledFor === today && !task.completed
    const borderClass = task.completed ? "border-l-emerald" : isToday ? "border-l-teal" : "border-l-amber"

    // Extract YouTube video ID for thumbnail
    const getYouTubeId = (url: string) => {
      const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
      return match ? match[1] : null
    }
    const videoId = getYouTubeId(task.videoUrl)

    return (
      <Card className={`transition-all duration-200 overflow-hidden ${task.completed ? "opacity-60" : "card-hover-lift"} ${borderClass}`}>
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1 space-y-3">
              {/* Status & Today Badge */}
              <div className="flex items-center gap-2 flex-wrap">
                {statusBadge(task.completed)}
                {isToday && (
                  <Badge className="bg-teal-50 text-teal-700 border border-teal-200/50 dark:bg-teal-950/50 dark:text-teal-400 dark:border-teal-800/50">
                    Today
                  </Badge>
                )}
              </div>

              {/* URL with YouTube icon */}
              <a
                href={task.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 hover:underline transition-colors duration-200 group/link"
              >
                <Youtube className="h-4 w-4 text-red-500 group-hover/link:text-red-600 transition-colors duration-200" />
                {task.videoUrl.length > 60 ? task.videoUrl.substring(0, 60) + "..." : task.videoUrl}
                <ExternalLink className="h-3 w-3 opacity-0 group-hover/link:opacity-100 transition-opacity duration-200" />
              </a>

              {/* Meta info */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {task.durationMin} min
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {task.scheduledFor}
                </span>
                {task.completedAt && (
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <Check className="h-3.5 w-3.5" />
                    {format(new Date(task.completedAt), "MMM d, HH:mm")}
                  </span>
                )}
              </div>

              {/* Learned Items Section */}
              {task.learnedItems.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">
                    <BookOpen className="h-3 w-3" />
                    Learned Items ({task.learnedItems.length})
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {task.learnedItems.map((item) => (
                      <LearnedItemRow
                        key={item.id}
                        item={item}
                        taskId={task.id}
                        onUpdated={fetchTasks}
                        onDeleteConfirm={openItemDeleteConfirm}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Add Item Section */}
              {!task.completed && (
                <div className="pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200 gap-1.5"
                  >
                    {expandedTask === task.id ? (
                      <><ChevronUp className="h-3.5 w-3.5" />Hide Form</>
                    ) : (
                      <><ChevronDown className="h-3.5 w-3.5" />Add Items</>
                    )}
                  </Button>
                  {expandedTask === task.id && (
                    <AddItemInline taskId={task.id} onAdded={fetchTasks} />
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              {!task.completed && (
                <Button size="sm" variant="outline" onClick={() => markComplete(task.id)} className="h-8 gap-1.5 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 dark:hover:bg-emerald-950 dark:hover:text-emerald-400 transition-colors duration-200">
                  <Check className="h-3.5 w-3.5" />Done
                </Button>
              )}
              <Button size="sm" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors duration-200" onClick={() => openDeleteConfirm(task.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Listening Tasks"
        description="Track your daily listening sessions"
        icon={Headphones}
        gradient="bg-gradient-to-r from-teal-600 to-emerald-600"
      >
        <CreateTaskDialog open={dialogOpen} onOpenChange={setDialogOpen} onCreated={fetchTasks} />
      </PageHeader>

      {/* Daily Summary */}
      <div className="grid gap-3 sm:grid-cols-3 stagger-children">
        <Card className="border-l-teal">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-teal-50 to-teal-100/50 p-2.5 dark:from-teal-950 dark:to-teal-900/30">
              <CalendarDays className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Scheduled Today</p>
              <p className="text-2xl font-bold tracking-tight">{todayTasks.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-emerald">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-2.5 dark:from-emerald-950 dark:to-emerald-900/30">
              <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Completed Today</p>
              <p className="text-2xl font-bold tracking-tight">{todayCompleted}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-amber">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 p-2.5 dark:from-amber-950 dark:to-amber-900/30">
              <BookOpen className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Items Today</p>
              <p className="text-2xl font-bold tracking-tight">{todayItems}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Lists */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : tasks.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-950/50">
              <Headphones className="h-8 w-8 text-teal-500/60" />
            </div>
            <h3 className="text-lg font-semibold">No tasks yet</h3>
            <p className="text-sm text-muted-foreground mt-1">Create your first listening task to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Today's Tasks */}
          {todayTasks.filter((t) => !t.completed).length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse-soft" />
                Today&apos;s Tasks
              </h2>
              <div className="space-y-3 stagger-children">
                {todayTasks.filter((t) => !t.completed).map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}

          {/* Future Tasks */}
          {futureTasks.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Upcoming
              </h2>
              <div className="space-y-3 stagger-children">
                {futureTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Completed
              </h2>
              <div className="space-y-3 stagger-children">
                {completedTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Task?"
        description="This listening task and all its learned items will be permanently removed."
        onConfirm={() => deleteTargetId && deleteTask(deleteTargetId)}
      />

      <ConfirmDialog
        open={deleteItemConfirmOpen}
        onOpenChange={setDeleteItemConfirmOpen}
        title="Delete Item?"
        description={`"${deleteItemContent}" will be permanently removed from this task.`}
        onConfirm={deleteItem}
      />
    </div>
  )
}
