"use server"

import { db } from "@/lib/db"
import {
  contributionApprovals,
  contributions,
  notifications,
  projectMembers,
  projects,
} from "@/lib/db/schema"
import { getUserId, isProjectLeaderOrManager } from "@/lib/permissions"
import { logAudit } from "@/lib/audit"
import { contributionSchema, reviewDecisionSchema } from "@/lib/validations"
import { and, desc, eq } from "drizzle-orm"
import { nanoid } from "nanoid"
import { revalidatePath } from "next/cache"

type ActionResult = { success: true } | { success: false; error: string }

export async function getMyContributions() {
  const userId = await getUserId()
  return db
    .select({ contribution: contributions, project: projects, member: projectMembers })
    .from(contributions)
    .innerJoin(projectMembers, eq(contributions.memberId, projectMembers.id))
    .innerJoin(projects, eq(contributions.projectId, projects.id))
    .where(eq(projectMembers.userId, userId))
    .orderBy(desc(contributions.createdAt))
}

export async function submitContribution(input: unknown): Promise<ActionResult> {
  const userId = await getUserId()
  const parsed = contributionSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }

  const [membership] = await db
    .select()
    .from(projectMembers)
    .where(
      and(
        eq(projectMembers.projectId, parsed.data.projectId),
        eq(projectMembers.userId, userId),
        eq(projectMembers.status, "active"),
      ),
    )
    .limit(1)
  if (!membership) return { success: false, error: "You must be an active member of this project" }

  const [project] = await db.select().from(projects).where(eq(projects.id, parsed.data.projectId)).limit(1)
  if (!project) return { success: false, error: "Project not found" }

  const id = nanoid()
  await db.insert(contributions).values({
    id,
    projectId: parsed.data.projectId,
    memberId: membership.id,
    title: parsed.data.title,
    description: parsed.data.description,
    contentUrl: parsed.data.contentUrl || null,
  })

  await db.insert(notifications).values({
    id: nanoid(),
    userId: project.leaderId,
    type: "contribution_submitted",
    title: "New contribution submitted",
    message: `A new contribution was submitted to "${project.title}"`,
    link: `/dashboard/projects/${project.id}/contributions`,
  })

  await logAudit({ actorId: userId, action: "contribution.submitted", entityType: "contribution", entityId: id })
  revalidatePath("/dashboard/contributions")
  return { success: true }
}

export async function withdrawContribution(contributionId: string): Promise<ActionResult> {
  const userId = await getUserId()
  const [contribution] = await db.select().from(contributions).where(eq(contributions.id, contributionId)).limit(1)
  if (!contribution) return { success: false, error: "Contribution not found" }

  const [membership] = await db.select().from(projectMembers).where(eq(projectMembers.id, contribution.memberId)).limit(1)
  if (!membership || membership.userId !== userId) return { success: false, error: "You cannot withdraw this contribution" }
  if (contribution.status !== "submitted") return { success: false, error: "Only submitted contributions can be withdrawn" }

  await db.update(contributions).set({ status: "withdrawn", updatedAt: new Date() }).where(eq(contributions.id, contributionId))
  await logAudit({ actorId: userId, action: "contribution.withdrawn", entityType: "contribution", entityId: contributionId })
  revalidatePath("/dashboard/contributions")
  return { success: true }
}

export async function reviewContribution(input: unknown): Promise<ActionResult> {
  const userId = await getUserId()
  const parsed = reviewDecisionSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }

  const [contribution] = await db.select().from(contributions).where(eq(contributions.id, parsed.data.id)).limit(1)
  if (!contribution) return { success: false, error: "Contribution not found" }
  if (contribution.status !== "submitted") return { success: false, error: "This contribution has already been reviewed" }

  const [project] = await db.select().from(projects).where(eq(projects.id, contribution.projectId)).limit(1)
  if (!project) return { success: false, error: "Project not found" }

  const [reviewerMembership] = await db
    .select()
    .from(projectMembers)
    .where(and(eq(projectMembers.projectId, project.id), eq(projectMembers.userId, userId)))
    .limit(1)

  if (project.leaderId !== userId && !isProjectLeaderOrManager(reviewerMembership?.roleInProject)) {
    return { success: false, error: "Only the project leader or a manager can review contributions" }
  }

  const newStatus = parsed.data.decision === "approved" ? "approved" : "rejected"

  await db.update(contributions).set({ status: newStatus, updatedAt: new Date() }).where(eq(contributions.id, contribution.id))

  await db.insert(contributionApprovals).values({
    id: nanoid(),
    contributionId: contribution.id,
    reviewerId: userId,
    decision: parsed.data.decision,
    comment: parsed.data.comment,
  })

  const [contributorMembership] = await db
    .select()
    .from(projectMembers)
    .where(eq(projectMembers.id, contribution.memberId))
    .limit(1)

  if (contributorMembership) {
    await db.insert(notifications).values({
      id: nanoid(),
      userId: contributorMembership.userId,
      type: newStatus === "approved" ? "contribution_approved" : "contribution_rejected",
      title: newStatus === "approved" ? "Contribution approved" : "Contribution rejected",
      message: `Your contribution "${contribution.title}" was ${newStatus}`,
      link: `/projects/${project.slug}`,
    })
  }

  await logAudit({
    actorId: userId,
    action: `contribution.${newStatus}`,
    entityType: "contribution",
    entityId: contribution.id,
    metadata: { comment: parsed.data.comment },
  })

  revalidatePath(`/dashboard/projects/${project.id}/contributions`)
  return { success: true }
}
