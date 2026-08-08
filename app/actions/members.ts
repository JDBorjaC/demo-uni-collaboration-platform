"use server"

import { db } from "@/lib/db"
import { notifications, projectMembers, projects } from "@/lib/db/schema"
import { getUserId } from "@/lib/permissions"
import { logAudit } from "@/lib/audit"
import { and, eq } from "drizzle-orm"
import { nanoid } from "nanoid"
import { revalidatePath } from "next/cache"

type ActionResult = { success: true } | { success: false; error: string }

async function assertIsLeader(projectId: string, userId: string) {
  const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1)
  if (!project) throw new Error("Project not found")
  if (project.leaderId !== userId) throw new Error("Only the project leader can manage members")
  return project
}

export async function promoteMember(memberId: string, roleInProject: "manager" | "contributor"): Promise<ActionResult> {
  const userId = await getUserId()
  const [member] = await db.select().from(projectMembers).where(eq(projectMembers.id, memberId)).limit(1)
  if (!member) return { success: false, error: "Member not found" }

  try {
    await assertIsLeader(member.projectId, userId)
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Forbidden" }
  }

  await db.update(projectMembers).set({ roleInProject }).where(eq(projectMembers.id, memberId))

  await logAudit({
    actorId: userId,
    action: "member.role_changed",
    entityType: "project_member",
    entityId: memberId,
    metadata: { roleInProject },
  })
  revalidatePath(`/dashboard/projects/${member.projectId}/members`)
  return { success: true }
}

export async function removeMember(memberId: string): Promise<ActionResult> {
  const userId = await getUserId()
  const [member] = await db.select().from(projectMembers).where(eq(projectMembers.id, memberId)).limit(1)
  if (!member) return { success: false, error: "Member not found" }
  if (member.roleInProject === "leader") return { success: false, error: "The project leader cannot be removed" }

  let project
  try {
    project = await assertIsLeader(member.projectId, userId)
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Forbidden" }
  }

  await db.update(projectMembers).set({ status: "removed" }).where(eq(projectMembers.id, memberId))

  await db.insert(notifications).values({
    id: nanoid(),
    userId: member.userId,
    type: "member_removed",
    title: "Removed from project",
    message: `You were removed from "${project.title}"`,
    link: `/projects/${project.slug}`,
  })

  await logAudit({ actorId: userId, action: "member.removed", entityType: "project_member", entityId: memberId })
  revalidatePath(`/dashboard/projects/${member.projectId}/members`)
  return { success: true }
}
