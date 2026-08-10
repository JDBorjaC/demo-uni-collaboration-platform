"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { submitContribution } from "@/app/actions/contributions"
import { Plus } from "lucide-react"
import { contributionTypeValues } from "@/lib/validations"

type Project = { id: string; title: string }

const CONTRIBUTION_TYPE_LABELS: Record<string, string> = {
  update: "Update — general progress report",
  milestone: "Milestone — key deliverable reached",
  resource: "Resource — file, link or reference",
  report: "Report — formal written report",
}

export function NewContributionDialog({ projects }: { projects: Project[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "")
  const [type, setType] = useState<(typeof contributionTypeValues)[number]>("update")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [contentUrl, setContentUrl] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function resetForm() {
    setProjectId(projects[0]?.id ?? "")
    setType("update")
    setTitle("")
    setDescription("")
    setContentUrl("")
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const result = await submitContribution({ projectId, type, title, description, contentUrl })

    setLoading(false)

    if (!result.success) {
      setError(result.error)
      return
    }

    toast.success("Contribution submitted for review")
    setOpen(false)
    resetForm()
    router.refresh()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) resetForm()
      }}
    >
      <DialogTrigger render={<Button size="sm" />}>
        <Plus className="size-4" data-icon="inline-start" />
        New contribution
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Submit a contribution</DialogTitle>
          <DialogDescription>Share your work with the project leader for review.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Project selector */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="contribution-project">Project</Label>
            <Select value={projectId} onValueChange={(val) => setProjectId(val ?? "")}>
              <SelectTrigger id="contribution-project">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Contribution type */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="contribution-type">Type</Label>
            <Select
              value={type}
              onValueChange={(val) => setType((val as (typeof contributionTypeValues)[number]) ?? "update")}
            >
              <SelectTrigger id="contribution-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {contributionTypeValues.map((t) => (
                  <SelectItem key={t} value={t}>
                    {CONTRIBUTION_TYPE_LABELS[t] ?? t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="contribution-title">Title</Label>
            <Input
              id="contribution-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={160}
              placeholder="e.g. Literature review draft"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="contribution-description">Description</Label>
            <Textarea
              id="contribution-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              maxLength={4000}
              placeholder="Describe the work you're submitting"
            />
          </div>

          {/* Link */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="contribution-url">
              Link{" "}
              <span className="text-xs text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="contribution-url"
              value={contentUrl}
              onChange={(e) => setContentUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={loading || !projectId}>
              {loading ? "Submitting..." : "Submit for review"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
