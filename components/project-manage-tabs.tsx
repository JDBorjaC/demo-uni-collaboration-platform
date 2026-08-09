"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { MoreHorizontal } from "lucide-react"

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

export function ProjectManageTabs({
  project,
  members,
  applications,
  contributions,
  categories,
  affiliations,
}: {
  project: Project
  members: { member: { id: string; roleInProject: string; userId: string; joinedAt: Date }; name: string; email: string; image: string | null }[]
  applications: {
    application: { id: string; status: string; message: string; createdAt: Date }
    name: string
    email: string
  }[]
  contributions: {
    contribution: { id: string; title: string; description: string; status: string; createdAt: Date; type: string; contentUrl: string | null }
    memberName: string
    roleInProject: string
  }[]
  categories: { id: string; name: string }[]
  affiliations: { id: string; name: string; type: string }[]
}) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

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

  async function handleContributionDecision(id: string, decision: "approved" | "rejected") {
    const result = await reviewContribution({ id, decision })
    if (!result.success) return toast.error(result.error)
    toast.success(`Contribution ${decision}`)
    router.refresh()
  }

  const pendingApplications = applications.filter((a) => a.application.status === "pending")
  const pendingContributions = contributions.filter((c) => c.contribution.status === "submitted")

  return (
    <div>
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
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="contributions">
            Contributions
            {pendingContributions.length > 0 && (
              <Badge className="ml-1.5 h-5 min-w-5 justify-center px-1">{pendingContributions.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-4">
          <ProjectForm categories={categories} affiliations={affiliations} project={project} />
        </TabsContent>

        <TabsContent value="applications" className="mt-4 flex flex-col gap-3">
          {applications.length === 0 ? (
            <EmptyState title="No applications yet" description="Applications will appear here once your project is published." />
          ) : (
            applications.map((a) => (
              <Card key={a.application.id} className="flex flex-col gap-3 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{a.name}</p>
                    <p className="text-sm text-muted-foreground">{a.email}</p>
                  </div>
                  <StatusBadge status={a.application.status} />
                </div>
                <p className="text-sm text-foreground">{a.application.message}</p>
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

        <TabsContent value="members" className="mt-4 flex flex-col gap-3">
          {members.length === 0 ? (
            <EmptyState title="No members yet" description="Approve applications to add collaborators." />
          ) : (
            members.map((m) => (
              <Card key={m.member.id} className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium text-foreground">{m.name}</p>
                  <p className="text-sm text-muted-foreground">{m.email}</p>
                </div>
                <div className="flex items-center gap-2">
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

        <TabsContent value="contributions" className="mt-4 flex flex-col gap-3">
          {contributions.length === 0 ? (
            <EmptyState title="No contributions yet" description="Member contributions will show up here for review." />
          ) : (
            contributions.map((c) => (
              <Card key={c.contribution.id} className="flex flex-col gap-3 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{c.contribution.title}</p>
                    <p className="text-sm text-muted-foreground">by {c.memberName}</p>
                  </div>
                  <StatusBadge status={c.contribution.status} />
                </div>
                <p className="text-sm text-foreground">{c.contribution.description}</p>
                {c.contribution.status === "submitted" && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleContributionDecision(c.contribution.id, "approved")}>
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleContributionDecision(c.contribution.id, "rejected")}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
