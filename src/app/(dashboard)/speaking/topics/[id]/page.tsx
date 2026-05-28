"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  Loader2,
  Mic,
  CalendarDays,
  MessageSquare,
  Sparkles,
  StickyNote,
  X,
  Check,
  Pencil,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { ConfirmDialog } from "@/components/confirm-dialog"

interface Session {
  id: string
  originalReply: string | null
  improvedReply: string | null
  notes: string | null
  practicedOn: string
  createdAt: string
}

interface Topic {
  id: string
  title: string
  category: string | null
  completed: boolean
  sessions: Session[]
}

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

const allCategories = [
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

// ═══════════════════════════════════════════════════════════════════════════════
// Add Session Dialog - manages its own form state
// ═══════════════════════════════════════════════════════════════════════════════

function AddSessionDialog({ topicId, open, onOpenChange, onAdded }: {
  topicId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdded: () => void
}) {
  const emptyForm = {
    originalReply: "",
    improvedReply: "",
    notes: "",
    practicedOn: new Date().toISOString().split("T")[0],
  }
  const [formData, setFormData] = useState(emptyForm)

  const addSession = async () => {
    try {
      await fetch("/api/speaking/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId, ...formData }),
      })
      setFormData(emptyForm)
      onOpenChange(false)
      toast.success("Session added!")
      onAdded()
    } catch {
      toast.error("Failed to add session")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="gradient-bg text-white shadow-sm shadow-teal-500/20">
          <Plus className="mr-1.5 h-3.5 w-3.5" />Add Session
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="gradient-text">Add Practice Session</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Original Reply</Label>
            <Textarea
              placeholder="What you said..."
              value={formData.originalReply}
              onChange={(e) => setFormData({ ...formData, originalReply: e.target.value })}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Improved Reply</Label>
            <Textarea
              placeholder="AI-corrected version..."
              value={formData.improvedReply}
              onChange={(e) => setFormData({ ...formData, improvedReply: e.target.value })}
              rows={3}
              className="border-emerald-200/50 dark:border-emerald-800/50 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-500/10"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Notes (optional)</Label>
            <Textarea
              placeholder="Any additional notes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Date</Label>
            <Input
              type="date"
              value={formData.practicedOn}
              onChange={(e) => setFormData({ ...formData, practicedOn: e.target.value })}
            />
          </div>
          <Button onClick={addSession} className="w-full gradient-bg text-white shadow-sm">
            Save Session
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Edit Session Form - inline editing with its own state
// ═══════════════════════════════════════════════════════════════════════════════

function EditSessionForm({ session, onSave, onCancel }: {
  session: Session
  onSave: () => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    originalReply: session.originalReply || "",
    improvedReply: session.improvedReply || "",
    notes: session.notes || "",
    practicedOn: session.practicedOn,
  })

  const editSession = async () => {
    try {
      await fetch(`/api/speaking/sessions/${session.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      toast.success("Session updated!")
      onSave()
    } catch {
      toast.error("Failed to update session")
    }
  }

  return (
    <div className="p-5 space-y-3">
      <div className="space-y-2">
        <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Original Reply</Label>
        <Textarea
          value={formData.originalReply}
          onChange={(e) => setFormData({ ...formData, originalReply: e.target.value })}
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Improved Reply</Label>
        <Textarea
          value={formData.improvedReply}
          onChange={(e) => setFormData({ ...formData, improvedReply: e.target.value })}
          rows={3}
          className="border-emerald-200/50 dark:border-emerald-800/50"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Notes</Label>
        <Textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={2}
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Date</Label>
        <Input
          type="date"
          value={formData.practicedOn}
          onChange={(e) => setFormData({ ...formData, practicedOn: e.target.value })}
        />
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={editSession} className="gradient-bg text-white">Save</Button>
        <Button size="sm" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Topic Inline Editor - manages its own title/category state
// ═══════════════════════════════════════════════════════════════════════════════

function TopicInlineEditor({ topic, onSaved, onCancelled }: {
  topic: Topic
  onSaved: (updatedTopic: Topic) => void
  onCancelled: () => void
}) {
  const [topicTitle, setTopicTitle] = useState(topic.title)
  const [topicCategory, setTopicCategory] = useState(topic.category || "")

  const saveTopicInfo = async () => {
    if (!topicTitle.trim()) {
      toast.error("Title cannot be empty")
      return
    }
    try {
      const res = await fetch(`/api/speaking/topics/${topic.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: topicTitle.trim(),
          category: topicCategory || null,
        }),
      })
      const data = await res.json()
      onSaved(data)
      toast.success("Topic updated!")
    } catch {
      toast.error("Failed to update topic")
    }
  }

  return (
    <div className="space-y-3">
      <Input
        value={topicTitle}
        onChange={(e) => setTopicTitle(e.target.value)}
        className="text-2xl font-bold h-auto py-1 border-teal-500/30 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
        placeholder="Topic title..."
      />
      <Select value={topicCategory} onValueChange={setTopicCategory}>
        <SelectTrigger className="w-[180px] h-9">
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          {allCategories.map((cat) => (
            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex gap-2">
        <Button size="sm" onClick={saveTopicInfo} className="gradient-bg text-white shadow-sm">
          <Check className="mr-1.5 h-3.5 w-3.5" />Save
        </Button>
        <Button size="sm" variant="outline" onClick={onCancelled}>Cancel</Button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Topic Detail Page
// ═══════════════════════════════════════════════════════════════════════════════

export default function TopicDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [topic, setTopic] = useState<Topic | null>(null)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editSessionId, setEditSessionId] = useState<string | null>(null)
  const [editingTopic, setEditingTopic] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  const fetchTopic = useCallback(async () => {
    try {
      const res = await fetch(`/api/speaking/topics/${id}`)
      const data = await res.json()
      setTopic(data)
    } catch {
      toast.error("Failed to fetch topic")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchTopic()
  }, [fetchTopic])

  const deleteSession = async (sessionId: string) => {
    try {
      await fetch(`/api/speaking/sessions/${sessionId}`, { method: "DELETE" })
      setDeleteConfirmOpen(false)
      setDeleteTargetId(null)
      toast.success("Session deleted")
      fetchTopic()
    } catch {
      toast.error("Failed to delete session")
    }
  }

  const openDeleteConfirm = (sessionId: string) => {
    setDeleteTargetId(sessionId)
    setDeleteConfirmOpen(true)
  }

  const toggleComplete = async () => {
    if (!topic) return
    try {
      await fetch(`/api/speaking/topics/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !topic.completed }),
      })
      toast.success(topic.completed ? "Marked as incomplete" : "Marked as complete!")
      fetchTopic()
    } catch {
      toast.error("Failed to update topic")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!topic) {
    return <div className="py-12 text-center text-muted-foreground">Topic not found</div>
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <Button variant="ghost" size="icon" onClick={() => router.push("/speaking")} className="shrink-0 h-9 w-9 hover:bg-accent transition-colors duration-200">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          {editingTopic ? (
            <TopicInlineEditor
              topic={topic}
              onSaved={(updatedTopic) => { setTopic(updatedTopic); setEditingTopic(false) }}
              onCancelled={() => setEditingTopic(false)}
            />
          ) : (
            <div>
              <div className="flex items-center gap-2.5 group">
                <h1 className="text-2xl font-bold tracking-tight">{topic.title}</h1>
                {topic.completed && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-muted-foreground hover:text-teal-600 dark:hover:text-teal-400"
                  onClick={() => setEditingTopic(true)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                {topic.category ? (
                  <Badge className={`text-[10px] uppercase tracking-wider border ${categoryColors[topic.category] || "bg-accent/50 border-border/50"}`}>
                    {topic.category}
                  </Badge>
                ) : (
                  <button
                    onClick={() => setEditingTopic(true)}
                    className="text-[10px] uppercase tracking-wider text-muted-foreground/50 hover:text-muted-foreground border border-dashed border-border/50 rounded-md px-2 py-0.5 transition-colors duration-200"
                  >
                    + Add category
                  </button>
                )}
                <span className="text-xs text-muted-foreground">
                  {topic.sessions.length} session{topic.sessions.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleComplete}
            className={`transition-colors duration-200 ${topic.completed ? "hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 dark:hover:bg-amber-950 dark:hover:text-amber-400" : "hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 dark:hover:bg-emerald-950 dark:hover:text-emerald-400"}`}
          >
            {topic.completed ? "Mark Incomplete" : "Mark Complete"}
          </Button>
          <AddSessionDialog topicId={id} open={dialogOpen} onOpenChange={setDialogOpen} onAdded={fetchTopic} />
        </div>
      </div>

      {/* Sessions */}
      {topic.sessions.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-950/50">
              <Mic className="h-8 w-8 text-teal-500/60" />
            </div>
            <h3 className="text-lg font-semibold">No sessions yet</h3>
            <p className="text-sm text-muted-foreground mt-1">Add your first practice session for this topic</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 stagger-children">
          {topic.sessions.map((session, idx) => (
            <Card key={session.id} className="overflow-hidden transition-all duration-200 hover:shadow-md group">
              <CardContent className="p-0">
                {editSessionId === session.id ? (
                  <EditSessionForm
                    session={session}
                    onSave={() => { setEditSessionId(null); fetchTopic() }}
                    onCancel={() => setEditSessionId(null)}
                  />
                ) : (
                  <div className="flex">
                    {/* Session number indicator */}
                    <div className="flex flex-col w-12 shrink-0 items-center py-5 bg-gradient-to-b from-muted/30 to-muted/10 border-r border-border/30">
                      <span className="text-xs font-bold text-muted-foreground/50">#{topic.sessions.length - idx}</span>
                      <div className="mt-2 flex-1 w-px bg-gradient-to-b from-border/40 via-border/20 to-transparent" />
                    </div>
                    <div className="flex-1 p-5 space-y-4">
                      {/* Header with date and actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-accent/50 rounded-md px-2.5 py-1">
                            <CalendarDays className="h-3 w-3" />
                            {session.practicedOn}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Button size="icon" variant="ghost" className="h-7 w-7 hover:bg-accent transition-colors duration-200" onClick={() => setEditSessionId(session.id)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive transition-colors duration-200" onClick={() => openDeleteConfirm(session.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Original & Improved - Side by side on desktop */}
                      <div className="grid gap-3 md:grid-cols-2">
                        {session.originalReply && (
                          <div className="rounded-xl bg-accent/20 border border-border/30 p-3.5 space-y-1.5">
                            <div className="flex items-center gap-1.5">
                              <MessageSquare className="h-3.5 w-3.5 text-muted-foreground/60" />
                              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Original</p>
                            </div>
                            <p className="text-sm leading-relaxed">{session.originalReply}</p>
                          </div>
                        )}
                        {session.improvedReply && (
                          <div className="rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/30 dark:border-emerald-800/30 p-3.5 space-y-1.5">
                            <div className="flex items-center gap-1.5">
                              <Sparkles className="h-3.5 w-3.5 text-emerald-600/60 dark:text-emerald-400/60" />
                              <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-600/70 dark:text-emerald-400/70">Improved</p>
                            </div>
                            <p className="text-sm leading-relaxed">{session.improvedReply}</p>
                          </div>
                        )}
                      </div>

                      {/* Notes */}
                      {session.notes && (
                        <div className="flex items-start gap-2 rounded-lg bg-amber-50/30 dark:bg-amber-950/10 border border-amber-200/20 dark:border-amber-800/20 px-3 py-2">
                          <StickyNote className="h-3.5 w-3.5 mt-0.5 text-amber-600/50 dark:text-amber-400/50 shrink-0" />
                          <p className="text-sm text-muted-foreground">{session.notes}</p>
                        </div>
                      )}
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
        title="Delete Session?"
        description="This practice session and all its data will be permanently removed."
        onConfirm={() => deleteTargetId && deleteSession(deleteTargetId)}
      />
    </div>
  )
}
