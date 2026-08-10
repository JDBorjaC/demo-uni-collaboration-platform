"use client"

import { useState, KeyboardEvent } from "react"
import { useRouter } from "next/navigation"
import { createProject, updateProject } from "@/app/actions/projects"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { X, Plus } from "lucide-react"

type Category = { id: string; name: string }
type Affiliation = { id: string; name: string; type: string }

type ExistingProject = {
  id: string
  title: string
  summary: string
  description: string
  objectives: string | null
  collaborationNeeds: string[] | null
  categoryId: string | null
  universityAffiliationId: string | null
  visibility: "public" | "university_only"
  maxMembers: number
  coverImageUrl: string | null
}

export function ProjectForm({
  categories,
  affiliations = [],
  project,
}: {
  categories: Category[]
  affiliations?: Affiliation[]
  project?: ExistingProject
}) {
  const router = useRouter()
  const [title, setTitle] = useState(project?.title ?? "")
  const [summary, setSummary] = useState(project?.summary ?? "")
  const [description, setDescription] = useState(project?.description ?? "")
  const [objectives, setObjectives] = useState(project?.objectives ?? "")
  const [collaborationNeeds, setCollaborationNeeds] = useState<string[]>(
    project?.collaborationNeeds ?? [],
  )
  const [needInput, setNeedInput] = useState("")
  const [categoryId, setCategoryId] = useState(project?.categoryId ?? "")
  const [universityAffiliationId, setUniversityAffiliationId] = useState(
    project?.universityAffiliationId ?? "",
  )
  const [visibility, setVisibility] = useState<"public" | "university_only">(
    project?.visibility ?? "public",
  )
  const [maxMembers, setMaxMembers] = useState(project?.maxMembers ?? 6)
  const [coverImageUrl, setCoverImageUrl] = useState(project?.coverImageUrl ?? "")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function addNeed() {
    const trimmed = needInput.trim()
    if (trimmed && !collaborationNeeds.includes(trimmed)) {
      setCollaborationNeeds((prev) => [...prev, trimmed])
    }
    setNeedInput("")
  }

  function removeNeed(need: string) {
    setCollaborationNeeds((prev) => prev.filter((n) => n !== need))
  }

  function handleNeedKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addNeed()
    }
    if (e.key === "Backspace" && needInput === "" && collaborationNeeds.length > 0) {
      setCollaborationNeeds((prev) => prev.slice(0, -1))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const payload = {
      title,
      summary,
      description,
      objectives,
      collaborationNeeds,
      categoryId,
      universityAffiliationId,
      visibility,
      maxMembers,
      coverImageUrl,
    }

    const result = project
      ? await updateProject({ id: project.id, ...payload })
      : await createProject(payload)

    setLoading(false)

    if (!result.success) {
      setError(result.error)
      return
    }

    toast.success(project ? "Project updated" : "Project created as draft")
    router.push(project ? `/dashboard/projects/${project.id}` : `/dashboard/projects`)
    router.refresh()
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Title */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={120} />
        </div>

        {/* Summary */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="summary">Summary</Label>
          <Textarea
            id="summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            required
            rows={2}
            maxLength={280}
            placeholder="One or two sentences describing the project"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="description">Full description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={6}
            placeholder="Goals, methodology, expected outcomes, and what kind of collaborators you're looking for"
          />
        </div>

        {/* Objectives */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="objectives">
            Objectives{" "}
            <span className="text-xs text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Textarea
            id="objectives"
            value={objectives}
            onChange={(e) => setObjectives(e.target.value)}
            rows={3}
            maxLength={3000}
            placeholder="List the specific goals you aim to achieve with this project"
          />
        </div>

        {/* Collaboration needs (chip input) */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="collaboration-needs">
            Collaboration needs{" "}
            <span className="text-xs text-muted-foreground font-normal">(optional)</span>
          </Label>
          <p className="text-xs text-muted-foreground -mt-1">
            Add skills or roles you are looking for. Press Enter or comma to add each.
          </p>
          <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
            {collaborationNeeds.map((need) => (
              <Badge key={need} variant="secondary" className="gap-1 pr-1 text-xs">
                {need}
                <button
                  type="button"
                  onClick={() => removeNeed(need)}
                  className="ml-0.5 rounded-sm opacity-70 hover:opacity-100 focus:outline-none"
                  aria-label={`Remove ${need}`}
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
            <input
              id="collaboration-needs"
              value={needInput}
              onChange={(e) => setNeedInput(e.target.value)}
              onKeyDown={handleNeedKeyDown}
              onBlur={addNeed}
              placeholder={collaborationNeeds.length === 0 ? "e.g. Data Scientist, UX Designer…" : ""}
              className="min-w-32 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Category + Institution row */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="category">Category</Label>
            <Select value={categoryId} onValueChange={(val) => setCategoryId(val ?? "")}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {affiliations.length > 0 && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="affiliation">
                Institution{" "}
                <span className="text-xs text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Select
                value={universityAffiliationId}
                onValueChange={(val) => setUniversityAffiliationId(val === "_none" ? "" : (val ?? ""))}
              >
                <SelectTrigger id="affiliation">
                  <SelectValue placeholder="Select institution" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">None</SelectItem>
                  {affiliations.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Visibility + Max members row */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="visibility">Visibility</Label>
            <Select value={visibility} onValueChange={(v) => setVisibility(v as typeof visibility)}>
              <SelectTrigger id="visibility">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="university_only">University only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="maxMembers">Max members</Label>
            <Input
              id="maxMembers"
              type="number"
              min={1}
              max={50}
              value={maxMembers}
              onChange={(e) => setMaxMembers(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Cover image URL */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="coverImageUrl">
            Cover image URL{" "}
            <span className="text-xs text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Input
            id="coverImageUrl"
            value={coverImageUrl}
            onChange={(e) => setCoverImageUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : project ? "Save changes" : "Create draft"}
          </Button>
        </div>
      </form>
    </Card>
  )
}
