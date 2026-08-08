"use server"

import { db } from "@/lib/db"
import { collaborationApplications, notifications, projectMembers, projects } from "@/lib/db/schema"
import { getUserId, isProjectLeaderOrManager } from "@/lib/permissions"
import { logAudit } from "@/lib/audit"
import { applicationSchema, reviewDecisionSchema } from "@/lib/validations"
import { and, count, desc, eq } from "drizzle-orm"
import { nanoid } from "nanoid"
import { revalidatePath } from "next/cache"

type ActionResult = { success: true } | { success: false; error: string }

export async function getMyApplications() {
  const userId = await getUserId()
  return db
    .select({ application: collaborationApplications, project: projects })
    .from(collaborationApplications)
    .innerJoin(projects, eq(collaborationApplications.projectId, projects.id))
    .where(eq(collaborationApplications.applicantId, userId))
    .orderBy(desc(collaborationApplications.createdAt))
}

export async function applyToProject(input: unknown): Promise<ActionResult> {
  const userId = await getUserId()
  const parsed = applicationSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }

  const [project] = await db.select().from(projects).where(eq(projects.id, parsed.data.projectId)).limit(1)
  if (!project) return { success: false, error: "Project not found" }
  if (project.status !== "published") return { success: false, error: "This project is not accepting applications" }
  if (project.leaderId === userId) return { success: false, error: "You already lead this project" }

  const [existingMember] = await db
    .select()
    .from(projectMembers)
    .where(and(eq(projectMembers.projectId, project.id), eq(projectMembers.userId, userId)))
    .limit(1)
  if (existingMember && existingMember.status === "active") {
    return { success: false, error: "You are already a member of this project" }
  }

  const [pending] = await db
    .select()
    .from(collaborationApplications)
    .where(
      and(
        eq(collaborationApplications.projectId, project.id),
        eq(collaborationApplications.applicantId, userId),
        eq(collaborationApplications.status, "pending"),
      ),
    )
    .limit(1)
  if (pending) return { success: false, error: "You already have a pending application for this project" }

  const [{ value: memberCount }] = await db
    .select({ value: count() })
    .from(projectMembers)
    .where(and(eq(projectMembers.projectId, project.id), eq(projectMembers.status, "active")))
  if (memberCount >= project.maxMembers) {
    return { success: false, error: "This project has reached its member capacity" }
  }

  const id = nanoid()
  await db.insert(collaborationApplications).values({
    id,
    projectId: project.id,
    applicantId: userId,
    message: parsed.data.message,
  })

  await db.insert(notifications).values({
    id: nanoid(),
    userId: project.leaderId,
    type: "application_received",
    title: "New collaboration request",
    message: `Someone applied to join "${project.title}"`,
    link: `/dashboard/projects/${project.id}/applications`,
  })

  await logAudit({ actorId: userId, action: "application.created", entityType: "collaboration_application", entityId: id })
  revalidatePath("/dashboard/applications")
  return { success: true }
}

export async function withdrawApplication(applicationId: string): Promise<ActionResult> {
  const userId = await getUserId()
  const [application] = await db
    .select()
    .from(collaborationApplications)
    .where(eq(collaborationApplications.id, applicationId))
    .limit(1)
  if (!application) return { success: false, error: "Application not found" }
  if (application.applicantId !== userId) return { success: false, error: "You cannot withdraw this application" }
  if (application.status !== "pending") return { success: false, error: "Only pending applications can be withdrawn" }

  await db
    .update(collaborationApplications)
    .set({ status: "withdrawn", reviewedAt: new Date() })
    .where(eq(collaborationApplications.id, applicationId))

  await logAudit({ actorId: userId, action: "application.withdrawn", entityType: "collaboration_application", entityId: applicationId })
  revalidatePath("/dashboard/applications")
  return { success: true }
}

export async function reviewApplication(input: unknown): Promise<ActionResult> {
  const userId = await getUserId()
  const parsed = reviewDecisionSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }

  const [application] = await db
    .select()
    .from(collaborationApplications)
    .where(eq(collaborationApplications.id, parsed.data.id))
    .limit(1)
  if (!application) return { success: false, error: "Application not found" }
  if (application.status !== "pending") return { success: false, error: "This application has already been reviewed" }

  const [project] = await db.select().from(projects).where(eq(projects.id, application.projectId)).limit(1)
  if (!project) return { success: false, error: "Project not found" }

  const [membership] = await db
    .select()
    .from(projectMembers)
    .where(and(eq(projectMembers.projectId, project.id), eq(projectMembers.userId, userId)))
    .limit(1)

  if (project.leaderId !== userId && !isProjectLeaderOrManager(membership?.roleInProject)) {
    return { success: false, error: "Only the project leader or a manager can review applications" }
  }

  const newStatus = parsed.data.decision === "approved" ? "approved" : "rejected"

  await db
    .update(collaborationApplications)
    .set({ status: newStatus, reviewedBy: userId, reviewedAt: new Date() })
    .where(eq(collaborationApplications.id, application.id))

  if (newStatus === "approved") {
    const [existingMember] = await db
      .select()
      .from(projectMembers)
      .where(and(eq(projectMembers.projectId, project.id), eq(projectMembers.userId, application.applicantId)))
      .limit(1)

    if (existingMember) {
      await db
        .update(projectMembers)
        .set({ status: "active", roleInProject: "contributor" })
        .where(eq(projectMembers.id, existingMember.id))
    } else {
      await db.insert(projectMembers).values({
        id: nanoid(),
        projectId: project.id,
        userId: application.applicantId,
        roleInProject: "contributor",
        status: "active",
      })
    }
  }

  await db.insert(notifications).values({
    id: nanoid(),
    userId: application.applicantId,
    type: newStatus === "approved" ? "application_approved" : "application_rejected",
    title: newStatus === "approved" ? "Application approved" : "Application rejected",
    message: `Your application to "${project.title}" was ${newStatus}`,
    link: `/projects/${project.slug}`,
  })

  await logAudit({
    actorId: userId,
    action: `application.${newStatus}`,
    entityType: "collaboration_application",
    entityId: application.id,
    metadata: { comment: parsed.data.comment },
  })

  revalidatePath(`/dashboard/projects/${project.id}/applications`)
  return { success: true }
}
