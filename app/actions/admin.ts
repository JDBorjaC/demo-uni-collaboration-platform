"use server"

import { db } from "@/lib/db"
import { auditLogs, profiles, universityAffiliations, user } from "@/lib/db/schema"
import { requireAdmin, type Role } from "@/lib/permissions"
import { logAudit } from "@/lib/audit"
import { desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

type ActionResult = { success: true } | { success: false; error: string }

export async function getAllUsersWithProfiles() {
  await requireAdmin()
  return db
    .select({
      user,
      profile: profiles,
      affiliationName: universityAffiliations.name,
    })
    .from(user)
    .leftJoin(profiles, eq(profiles.userId, user.id))
    .leftJoin(universityAffiliations, eq(profiles.universityAffiliationId, universityAffiliations.id))
    .orderBy(desc(user.createdAt))
}

export async function setUserVerification(
  profileId: string,
  status: "verified" | "rejected" | "pending",
): Promise<ActionResult> {
  const adminId = await requireAdmin()

  await db.update(profiles).set({ verificationStatus: status, updatedAt: new Date() }).where(eq(profiles.id, profileId))

  await logAudit({
    actorId: adminId,
    action: "profile.verification_updated",
    entityType: "profile",
    entityId: profileId,
    metadata: { status },
  })

  revalidatePath("/admin/users")
  return { success: true }
}

export async function setUserRole(profileId: string, role: Role): Promise<ActionResult> {
  const adminId = await requireAdmin()

  await db.update(profiles).set({ role, updatedAt: new Date() }).where(eq(profiles.id, profileId))

  await logAudit({
    actorId: adminId,
    action: "profile.role_updated",
    entityType: "profile",
    entityId: profileId,
    metadata: { role },
  })

  revalidatePath("/admin/users")
  return { success: true }
}

export async function getAuditLogs(limit = 200) {
  await requireAdmin()
  return db
    .select({ log: auditLogs, actorName: user.name, actorEmail: user.email })
    .from(auditLogs)
    .leftJoin(user, eq(auditLogs.actorId, user.id))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit)
}

export async function revertAuditEntry(input: unknown): Promise<ActionResult> {
  const adminId = await requireAdmin()

  const { revertAuditSchema } = await import("@/lib/validations")
  const parsed = revertAuditSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }

  const [entry] = await db
    .select()
    .from(auditLogs)
    .where(eq(auditLogs.id, parsed.data.auditLogId))
    .limit(1)

  if (!entry) return { success: false, error: "Registro de auditoría no encontrado" }

  const previousData = entry.previousData as Record<string, unknown> | null

  // Attempt to restore previousData into the correct table
  if (previousData && Object.keys(previousData).length > 0) {
    if (entry.entityType === "project") {
      const { projects } = await import("@/lib/db/schema")
      await db
        .update(projects)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .set({ ...(previousData as any), updatedAt: new Date() })
        .where(eq(projects.id, entry.entityId))
    } else if (entry.entityType === "profile") {
      await db
        .update(profiles)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .set({ ...(previousData as any), updatedAt: new Date() })
        .where(eq(profiles.id, entry.entityId))
    }
  }

  // Log the revert action itself
  await logAudit({
    actorId: adminId,
    action: "audit.reverted",
    entityType: entry.entityType,
    entityId: entry.entityId,
    metadata: {
      revertedLogId: entry.id,
      originalAction: entry.action,
      reason: parsed.data.reason,
      hadPreviousData: !!previousData,
    },
  })

  revalidatePath("/admin/audit-logs")
  return { success: true }
}
