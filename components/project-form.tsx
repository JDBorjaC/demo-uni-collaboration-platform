"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createProject, updateProject } from "@/app/actions/projects"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

type Category = { id: string; name: string }

type ExistingProject = {
  id: string
  title: string
  summary: string
  description: string
  categoryId: string | null
  visibility: "public" | "university_only"
  maxMembers: number
  coverImageUrl: string | null
}

export function ProjectForm({ categories, project }: { categories: Category[]; project?: ExistingProject }) {
  const router = useRouter()
  const [title, setTitle] = useState(project?.title ?? "")
  const [summary, setSummary] = useState(project?.summary ?? "")
  const [description, setDescription] = useState(project?.description ?? "")
  const [categoryId, setCategoryId] = useState(project?.categoryId ?? "")
  const [visibility, setVisibility] = useState<"public" | "university_only">(project?.visibility ?? "public")
  const [maxMembers, setMaxMembers] = useState(project?.maxMembers ?? 6)
  const [coverImageUrl, setCoverImageUrl] = useState(project?.coverImageUrl ?? "")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const payload = { title, summary, description, categoryId, visibility, maxMembers, coverImageUrl }

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
        <div className="flex flex-col gap-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={120} />
        </div>

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
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
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
          <div className="flex flex-col gap-2">
            <Label htmlFor="coverImageUrl">Cover image URL (optional)</Label>
            <Input
              id="coverImageUrl"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
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
