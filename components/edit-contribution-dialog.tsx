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
import { updateContribution } from "@/app/actions/contributions"
import { Pencil } from "lucide-react"
import { contributionTypeValues } from "@/lib/validations"

type Contribution = {
  id: string
  title: string
  description: string
  type: string
  contentUrl: string | null
  status: string
}

const CONTRIBUTION_TYPE_LABELS: Record<string, string> = {
  update: "Update — general progress report",
  milestone: "Milestone — key deliverable reached",
  resource: "Resource — file, link or reference",
  report: "Report — formal written report",
}

export function EditContributionDialog({ contribution }: { contribution: Contribution }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<(typeof contributionTypeValues)[number]>(
    (contributionTypeValues as readonly string[]).includes(contribution.type)
      ? (contribution.type as (typeof contributionTypeValues)[number])
      : "update",
  )
  const [title, setTitle] = useState(contribution.title)
  const [description, setDescription] = useState(contribution.description)
  const [contentUrl, setContentUrl] = useState(contribution.contentUrl ?? "")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function resetForm() {
    setType(
      (contributionTypeValues as readonly string[]).includes(contribution.type)
        ? (contribution.type as (typeof contributionTypeValues)[number])
        : "update",
    )
    setTitle(contribution.title)
    setDescription(contribution.description)
    setContentUrl(contribution.contentUrl ?? "")
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const result = await updateContribution({
      id: contribution.id,
      type,
      title,
      description,
      contentUrl,
    })

    setLoading(false)

    if (!result.success) {
      setError(result.error)
      return
    }

    toast.success("Contribution updated")
    setOpen(false)
    router.refresh()
  }

  // Only submitted contributions can be edited
  if (contribution.status !== "submitted") return null

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) resetForm()
      }}
    >
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <Pencil className="size-3.5" data-icon="inline-start" />
        Edit
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit contribution</DialogTitle>
          <DialogDescription>
            You can edit this contribution while it is still pending review.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Type */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-contribution-type">Type</Label>
            <Select
              value={type}
              onValueChange={(val) =>
                setType((val as (typeof contributionTypeValues)[number]) ?? "update")
              }
            >
              <SelectTrigger id="edit-contribution-type">
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
            <Label htmlFor="edit-contribution-title">Title</Label>
            <Input
              id="edit-contribution-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={160}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-contribution-description">Description</Label>
            <Textarea
              id="edit-contribution-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              maxLength={4000}
            />
          </div>

          {/* Link */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-contribution-url">
              Link{" "}
              <span className="text-xs text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="edit-contribution-url"
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
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
