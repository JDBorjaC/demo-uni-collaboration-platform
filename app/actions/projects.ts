"use server"

import { db } from "@/lib/db"
import { moderationReviews, projectMembers, projects, projectStatusHistory, projectSubscriptions } from "@/lib/db/schema"
import { getCurrentUserWithProfile, getUserId, requireAdmin } from "@/lib/permissions"
import { logAudit } from "@/lib/audit"
import { createProjectSchema, updateProjectSchema, reviewDecisionSchema } from "@/lib/validations"
import { and, desc, eq } from "drizzle-orm"
import { nanoid } from "nanoid"
import { revalidatePath } from "next/cache"

type ActionResult<T = undefined> = { success: true; data?: T } | { success: false; error: string }

function slugify(title: string) {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 80) +
    "-" +
    nanoid(6)
  )
}

export async function getMyProjects() {
  const userId = await getUserId()
  return db.select().from(projects).where(eq(projects.leaderId, userId)).orderBy(desc(projects.createdAt))
}

export async function getMyMemberships() {
  const userId = await getUserId()
  return db
    .select({ member: projectMembers, project: projects })
    .from(projectMembers)
    .innerJoin(projects, eq(projectMembers.projectId, projects.id))
    .where(and(eq(projectMembers.userId, userId), eq(projectMembers.status, "active")))
    .orderBy(desc(projectMembers.joinedAt))
}

export async function getMySubscriptions() {
  const userId = await getUserId()
  return db
    .select({ subscription: projectSubscriptions, project: projects })
    .from(projectSubscriptions)
    .innerJoin(projects, eq(projectSubscriptions.projectId, projects.id))
    .where(eq(projectSubscriptions.userId, userId))
    .orderBy(desc(projectSubscriptions.createdAt))
}

export async function createProject(input: unknown): Promise<ActionResult<{ slug: string }>> {
  const { user, profile } = await getCurrentUserWithProfile()
  if (!profile) return { success: false, error: "Complete onboarding before creating a project" }
  if (profile.verificationStatus === "rejected") {
    return { success: false, error: "Your account verification was rejected. Contact an admin." }
  }

  const parsed = createProjectSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }

  const id = nanoid()
  const slug = slugify(parsed.data.title)

  await db.insert(projects).values({
    id,
    title: parsed.data.title,
    slug,
    summary: parsed.data.summary,
    description: parsed.data.description,
    objectives: parsed.data.objectives || null,
    collaborationNeeds: parsed.data.collaborationNeeds.length > 0 ? parsed.data.collaborationNeeds : null,
    categoryId: parsed.data.categoryId,
    universityAffiliationId: parsed.data.universityAffiliationId || null,
    leaderId: user.id,
    visibility: parsed.data.visibility,
    maxMembers: parsed.data.maxMembers,
    coverImageUrl: parsed.data.coverImageUrl || null,
    status: "draft",
  })

  await db.insert(projectMembers).values({
    id: nanoid(),
    projectId: id,
    userId: user.id,
    roleInProject: "leader",
    status: "active",
  })

  await logAudit({ actorId: user.id, action: "project.created", entityType: "project", entityId: id })
  revalidatePath("/dashboard/projects")
  return { success: true, data: { slug } }
}

export async function updateProject(input: unknown): Promise<ActionResult> {
  const userId = await getUserId()
  const parsed = updateProjectSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }

  const [existing] = await db.select().from(projects).where(eq(projects.id, parsed.data.id)).limit(1)
  if (!existing) return { success: false, error: "Project not found" }
  if (existing.leaderId !== userId) return { success: false, error: "Only the project leader can edit this project" }
  if (existing.status !== "draft" && existing.status !== "rejected") {
    return { success: false, error: "Only draft or rejected projects can be edited" }
  }

  const { id, ...fields } = parsed.data
  await db
    .update(projects)
    .set({
      ...(fields.title ? { title: fields.title } : {}),
      ...(fields.summary ? { summary: fields.summary } : {}),
      ...(fields.description ? { description: fields.description } : {}),
      ...(fields.objectives !== undefined ? { objectives: fields.objectives || null } : {}),
      ...(fields.collaborationNeeds !== undefined ? { collaborationNeeds: fields.collaborationNeeds.length > 0 ? fields.collaborationNeeds : null } : {}),
      ...(fields.categoryId ? { categoryId: fields.categoryId } : {}),
      ...(fields.universityAffiliationId !== undefined ? { universityAffiliationId: fields.universityAffiliationId || null } : {}),
      ...(fields.visibility ? { visibility: fields.visibility } : {}),
      ...(fields.maxMembers ? { maxMembers: fields.maxMembers } : {}),
      ...(fields.coverImageUrl !== undefined ? { coverImageUrl: fields.coverImageUrl || null } : {}),
      updatedAt: new Date(),
    })
    .where(eq(projects.id, id))

  await logAudit({ actorId: userId, action: "project.updated", entityType: "project", entityId: id })
  revalidatePath("/dashboard/projects")
  return { success: true }
}

export async function submitProjectForReview(projectId: string): Promise<ActionResult> {
  const userId = await getUserId()
  const [existing] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1)
  if (!existing) return { success: false, error: "Project not found" }
  if (existing.leaderId !== userId) return { success: false, error: "Only the project leader can submit for review" }
  if (existing.status !== "draft" && existing.status !== "rejected") {
    return { success: false, error: "Only draft or rejected projects can be submitted for review" }
  }

  await db
    .update(projects)
    .set({ status: "pending_review", updatedAt: new Date() })
    .where(eq(projects.id, projectId))

  await db.insert(projectStatusHistory).values({
    id: nanoid(),
    projectId,
    fromStatus: existing.status,
    toStatus: "pending_review",
    changedBy: userId,
  })

  await logAudit({ actorId: userId, action: "project.submitted_for_review", entityType: "project", entityId: projectId })
  revalidatePath("/dashboard/projects")
  revalidatePath("/admin/moderation")
  return { success: true }
}

export async function archiveProject(projectId: string): Promise<ActionResult> {
  const userId = await getUserId()
  const [existing] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1)
  if (!existing) return { success: false, error: "Project not found" }
  if (existing.leaderId !== userId) return { success: false, error: "Only the project leader can archive this project" }

  await db.update(projects).set({ status: "archived", updatedAt: new Date() }).where(eq(projects.id, projectId))
  await db.insert(projectStatusHistory).values({
    id: nanoid(),
    projectId,
    fromStatus: existing.status,
    toStatus: "archived",
    changedBy: userId,
  })
  await logAudit({ actorId: userId, action: "project.archived", entityType: "project", entityId: projectId })
  revalidatePath("/dashboard/projects")
  return { success: true }
}

export async function getPendingModerationProjects() {
  await requireAdmin()
  return db
    .select()
    .from(projects)
    .where(eq(projects.status, "pending_review"))
    .orderBy(desc(projects.updatedAt))
}

export async function reviewProject(input: unknown): Promise<ActionResult> {
  const adminId = await requireAdmin()
  const parsed = reviewDecisionSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }

  const [existing] = await db.select().from(projects).where(eq(projects.id, parsed.data.id)).limit(1)
  if (!existing) return { success: false, error: "Project not found" }
  if (existing.status !== "pending_review") return { success: false, error: "Project is not pending review" }

  const newStatus = parsed.data.decision === "approved" ? "published" : "rejected"

  await db.update(projects).set({ status: newStatus, updatedAt: new Date() }).where(eq(projects.id, existing.id))

  await db.insert(projectStatusHistory).values({
    id: nanoid(),
    projectId: existing.id,
    fromStatus: existing.status,
    toStatus: newStatus,
    changedBy: adminId,
    reason: parsed.data.comment,
  })

  await db.insert(moderationReviews).values({
    id: nanoid(),
    projectId: existing.id,
    reviewerId: adminId,
    decision: parsed.data.decision,
    comment: parsed.data.comment,
  })

  await logAudit({
    actorId: adminId,
    action: `project.${parsed.data.decision}`,
    entityType: "project",
    entityId: existing.id,
    metadata: { comment: parsed.data.comment },
  })

  revalidatePath("/admin/moderation")
  revalidatePath("/dashboard/projects")
  revalidatePath("/projects")
  return { success: true }
}

export async function subscribeToProject(projectId: string): Promise<ActionResult> {
  const userId = await getUserId()

  const { projectSubscriptions } = await import("@/lib/db/schema")

  const [existing] = await db
    .select()
    .from(projectSubscriptions)
    .where(and(eq(projectSubscriptions.projectId, projectId), eq(projectSubscriptions.userId, userId)))
    .limit(1)

  if (existing) return { success: false, error: "Already following this project" }

  await db.insert(projectSubscriptions).values({ id: nanoid(), projectId, userId })
  revalidatePath(`/projects`)
  return { success: true }
}

export async function unsubscribeFromProject(projectId: string): Promise<ActionResult> {
  const userId = await getUserId()

  const { projectSubscriptions } = await import("@/lib/db/schema")

  await db
    .delete(projectSubscriptions)
    .where(and(eq(projectSubscriptions.projectId, projectId), eq(projectSubscriptions.userId, userId)))

  revalidatePath(`/projects`)
  return { success: true }
}

