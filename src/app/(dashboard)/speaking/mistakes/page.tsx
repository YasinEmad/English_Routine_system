"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Plus,
  Trash2,
  Edit,
  Search,
  X,
  Check,
  Loader2,
  CalendarDays,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { PageHeader } from "@/components/page-header"

interface Mistake {
  id: string
  wrongVersion: string
  correctVersion: string
  explanation: string | null
  dateAdded: string
  createdAt: string
}

export default function MyMistakesPage() {
  const [mistakes, setMistakes] = useState<Mistake[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [formData, setFormData] = useState({
    wrongVersion: "",
    correctVersion: "",
    explanation: "",
    dateAdded: new Date().toISOString().split("T")[0],
  })

  const fetchMistakes = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
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
  }, [search, dateFrom, dateTo])

  useEffect(() => {
    fetchMistakes()
  }, [fetchMistakes])

  const addMistake = async () => {
    try {
      await fetch("/api/speaking/mistakes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      setFormData({
        wrongVersion: "",
        correctVersion: "",
        explanation: "",
        dateAdded: new Date().toISOString().split("T")[0],
      })
      setDialogOpen(false)
      toast.success("Mistake added!")
      fetchMistakes()
    } catch {
      toast.error("Failed to add mistake")
    }
  }

  const updateMistake = async (id: string) => {
    try {
      await fetch(`/api/speaking/mistakes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      setEditId(null)
      toast.success("Mistake updated!")
      fetchMistakes()
    } catch {
      toast.error("Failed to update mistake")
    }
  }

  const deleteMistake = async (id: string) => {
    if (!confirm("Delete this mistake?")) return
    try {
      await fetch(`/api/speaking/mistakes/${id}`, { method: "DELETE" })
      toast.success("Mistake deleted")
      fetchMistakes()
    } catch {
      toast.error("Failed to delete mistake")
    }
  }

  const startEdit = (m: Mistake) => {
    setEditId(m.id)
    setFormData({
      wrongVersion: m.wrongVersion,
      correctVersion: m.correctVersion,
      explanation: m.explanation || "",
      dateAdded: m.dateAdded,
    })
  }

  const FormFields = () => (
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Mistakes"
        description="Track and learn from your speaking errors"
        icon={AlertCircle}
        gradient="bg-gradient-to-r from-rose-600 to-red-600"
      >
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200">
              <Plus className="mr-2 h-4 w-4" />Add Mistake
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="gradient-text">Add New Mistake</DialogTitle>
            </DialogHeader>
            <FormFields />
            <Button onClick={addMistake} className="w-full mt-4 gradient-bg text-white shadow-sm">
              Save Mistake
            </Button>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Search & Filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
          <Input
            placeholder="Search mistakes..."
            className="pl-9 h-10 bg-background/50 border-muted-foreground/15"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
                  <div className="p-5 space-y-3">
                    <FormFields />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => updateMistake(mistake.id)} className="gradient-bg text-white">Save</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditId(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex">
                    <div className="flex flex-col w-1 shrink-0">
                      <div className="flex-1 bg-destructive/40" />
                      <div className="flex-1 bg-emerald-500/40" />
                    </div>
                    <div className="flex-1 p-5 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start gap-2.5">
                            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                              <X className="h-3 w-3 text-destructive" />
                            </div>
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-widest text-destructive/80 mb-0.5">Wrong</p>
                              <p className="text-sm">{mistake.wrongVersion}</p>
                            </div>
                          </div>
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
                          <Button size="icon" variant="ghost" className="h-7 w-7 hover:bg-accent transition-colors duration-200" onClick={() => startEdit(mistake)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive transition-colors duration-200" onClick={() => deleteMistake(mistake.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      {mistake.explanation && (
                        <p className="text-sm text-muted-foreground pl-7.5 bg-accent/30 rounded-md px-3 py-1.5">{mistake.explanation}</p>
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
    </div>
  )
}
