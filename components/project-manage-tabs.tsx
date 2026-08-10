"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { StatusBadge } from "@/components/status-badge"
import { EmptyState } from "@/components/empty-state"
import { ProjectForm } from "@/components/project-form"
import { submitProjectForReview, archiveProject } from "@/app/actions/projects"
import { reviewApplication } from "@/app/actions/applications"
import { promoteMember, removeMember } from "@/app/actions/members"
import { reviewContribution } from "@/app/actions/contributions"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, ExternalLink, CalendarDays, User } from "lucide-react"

type Project = {
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
  status: string
  slug: string
}

const CONTRIBUTION_TYPE_LABELS: Record<string, string> = {
  update: "Update",
  milestone: "Milestone",
  resource: "Resource",
  report: "Report",
}

const CONTRIBUTION_TYPE_COLORS: Record<string, string> = {
  update: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  milestone: "bg-green-500/10 text-green-600 dark:text-green-400",
  resource: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  report: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(date),
  )
}

export function ProjectManageTabs({
  project,
  members,
  applications,
  contributions,
  categories,
  affiliations,
}: {
  project: Project
  members: {
    member: { id: string; roleInProject: string; userId: string; joinedAt: Date }
    name: string
    email: string
    image: string | null
  }[]
  applications: {
    application: { id: string; status: string; message: string; createdAt: Date }
    name: string
    email: string
  }[]
  contributions: {
    contribution: {
      id: string
      title: string
      description: string
      status: string
      createdAt: Date
      type: string
      contentUrl: string | null
    }
    memberName: string
    roleInProject: string
  }[]
  categories: { id: string; name: string }[]
  affiliations: { id: string; name: string; type: string }[]
}) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  // reject comment state per contribution id
  const [rejectComment, setRejectComment] = useState<Record<string, string>>({})
  const [showRejectForm, setShowRejectForm] = useState<Record<string, boolean>>({})

  async function handleSubmitForReview() {
    setLoading("submit")
    const result = await submitProjectForReview(project.id)
    setLoading(null)
    if (!result.success) return toast.error(result.error)
    toast.success("Submitted for admin review")
    router.refresh()
  }

  async function handleArchive() {
    setLoading("archive")
    const result = await archiveProject(project.id)
    setLoading(null)
    if (!result.success) return toast.error(result.error)
    toast.success("Project archived")
    router.refresh()
  }

  async function handleApplicationDecision(id: string, decision: "approved" | "rejected") {
    const result = await reviewApplication({ id, decision })
    if (!result.success) return toast.error(result.error)
    toast.success(`Application ${decision}`)
    router.refresh()
  }

  async function handleMemberRole(memberId: string, role: "manager" | "contributor") {
    const result = await promoteMember(memberId, role)
    if (!result.success) return toast.error(result.error)
    toast.success("Member role updated")
    router.refresh()
  }

  async function handleRemoveMember(memberId: string) {
    const result = await removeMember(memberId)
    if (!result.success) return toast.error(result.error)
    toast.success("Member removed")
    router.refresh()
  }

  async function handleContributionApprove(id: string) {
    const result = await reviewContribution({ id, decision: "approved" })
    if (!result.success) return toast.error(result.error)
    toast.success("Contribution approved")
    router.refresh()
  }

  async function handleContributionReject(id: string) {
    const comment = rejectComment[id] ?? ""
    const result = await reviewContribution({ id, decision: "rejected", comment: comment || undefined })
    if (!result.success) return toast.error(result.error)
    toast.success("Contribution rejected")
    setShowRejectForm((prev) => ({ ...prev, [id]: false }))
    setRejectComment((prev) => ({ ...prev, [id]: "" }))
    router.refresh()
  }

  const pendingApplications = applications.filter((a) => a.application.status === "pending")
  const pendingContributions = contributions.filter((c) => c.contribution.status === "submitted")

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{project.title}</h1>
            <StatusBadge status={project.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{project.summary}</p>
        </div>
        <div className="flex gap-2">
          {project.status === "published" && (
            <Button
              render={<Link href={`/projects/${project.slug}`} />}
              nativeButton={false}
              variant="outline"
              size="sm"
            >
              View public page
            </Button>
          )}
          {(project.status === "draft" || project.status === "rejected") && (
            <Button size="sm" onClick={handleSubmitForReview} disabled={loading === "submit"}>
              {loading === "submit" ? "Submitting..." : "Submit for review"}
            </Button>
          )}
          {project.status !== "archived" && (
            <Button size="sm" variant="outline" onClick={handleArchive} disabled={loading === "archive"}>
              Archive
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="applications">
            Applications
            {pendingApplications.length > 0 && (
              <Badge className="ml-1.5 h-5 min-w-5 justify-center px-1">{pendingApplications.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="members">
            Members
            <Badge variant="secondary" className="ml-1.5 h-5 min-w-5 justify-center px-1">
              {members.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="contributions">
            Contributions
            {pendingContributions.length > 0 && (
              <Badge className="ml-1.5 h-5 min-w-5 justify-center px-1">{pendingContributions.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── DETAILS TAB ── */}
        <TabsContent value="details" className="mt-4">
          <ProjectForm categories={categories} affiliations={affiliations} project={project} />
        </TabsContent>

        {/* ── APPLICATIONS TAB ── */}
        <TabsContent value="applications" className="mt-4 flex flex-col gap-3">
          {applications.length === 0 ? (
            <EmptyState
              title="No applications yet"
              description="Applications will appear here once your project is published."
            />
          ) : (
            applications.map((a) => (
              <Card key={a.application.id} className="flex flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <p className="font-medium text-foreground">{a.name}</p>
                    <p className="text-sm text-muted-foreground">{a.email}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <CalendarDays className="size-3 shrink-0" />
                      Applied {formatDate(a.application.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={a.application.status} />
                </div>

                <blockquote className="border-l-2 border-muted pl-3 text-sm text-foreground/80 italic">
                  {a.application.message}
                </blockquote>

                {a.application.status === "pending" && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleApplicationDecision(a.application.id, "approved")}>
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApplicationDecision(a.application.id, "rejected")}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </Card>
            ))
          )}
        </TabsContent>

        {/* ── MEMBERS TAB ── */}
        <TabsContent value="members" className="mt-4 flex flex-col gap-3">
          {members.length === 0 ? (
            <EmptyState title="No members yet" description="Approve applications to add collaborators." />
          ) : (
            members.map((m) => (
              <Card key={m.member.id} className="flex items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Avatar */}
                  {m.image ? (
                    <img
                      src={m.image}
                      alt={m.name}
                      className="size-9 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                      <User className="size-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{m.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{m.email}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <CalendarDays className="size-3 shrink-0" />
                      Joined {formatDate(m.member.joinedAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="secondary" className="capitalize">
                    {m.member.roleInProject}
                  </Badge>
                  {m.member.roleInProject !== "leader" && (
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="size-8" />}>
                        <MoreHorizontal className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {m.member.roleInProject === "contributor" ? (
                          <DropdownMenuItem onClick={() => handleMemberRole(m.member.id, "manager")}>
                            Promote to manager
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleMemberRole(m.member.id, "contributor")}>
                            Demote to contributor
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleRemoveMember(m.member.id)}
                        >
                          Remove from project
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        {/* ── CONTRIBUTIONS TAB ── */}
        <TabsContent value="contributions" className="mt-4 flex flex-col gap-3">
          {contributions.length === 0 ? (
            <EmptyState
              title="No contributions yet"
              description="Member contributions will show up here for review."
            />
          ) : (
            contributions.map((c) => {
              const isRejectOpen = showRejectForm[c.contribution.id] ?? false
              const typeLabel = CONTRIBUTION_TYPE_LABELS[c.contribution.type] ?? c.contribution.type
              const typeColor =
                CONTRIBUTION_TYPE_COLORS[c.contribution.type] ??
                "bg-muted text-muted-foreground"

              return (
                <Card key={c.contribution.id} className="flex flex-col gap-3 p-4">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-foreground">{c.contribution.title}</p>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${typeColor}`}
                        >
                          {typeLabel}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        by {c.memberName} · {formatDate(c.contribution.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={c.contribution.status} />
                  </div>

                  {/* Description */}
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {c.contribution.description}
                  </p>

                  {/* External link */}
                  {c.contribution.contentUrl && (
                    <a
                      href={c.contribution.contentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                    >
                      <ExternalLink className="size-3.5" />
                      View attached resource
                    </a>
                  )}

                  {/* Action buttons — only for submitted contributions */}
                  {c.contribution.status === "submitted" && (
                    <div className="flex flex-col gap-2">
                      {!isRejectOpen ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleContributionApprove(c.contribution.id)}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setShowRejectForm((prev) => ({ ...prev, [c.contribution.id]: true }))
                            }
                          >
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3">
                          <p className="text-xs font-medium text-destructive">
                            Add a comment explaining the rejection (optional)
                          </p>
                          <Textarea
                            value={rejectComment[c.contribution.id] ?? ""}
                            onChange={(e) =>
                              setRejectComment((prev) => ({
                                ...prev,
                                [c.contribution.id]: e.target.value,
                              }))
                            }
                            rows={2}
                            maxLength={1000}
                            placeholder="e.g. Please revise the methodology section…"
                            className="text-sm"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleContributionReject(c.contribution.id)}
                            >
                              Confirm rejection
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                setShowRejectForm((prev) => ({
                                  ...prev,
                                  [c.contribution.id]: false,
                                }))
                              }
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              )
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
