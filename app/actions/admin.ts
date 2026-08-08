"use server"

import { db } from "@/lib/db"
import { auditLogs, profiles, universityAffiliations, user } from "@/lib/db/schema"
import { requireAdmin } from "@/lib/permissions"
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

export async function setUserRole(profileId: string, role: "student" | "faculty" | "admin"): Promise<ActionResult> {
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

export async function getAuditLogs(limit = 100) {
  await requireAdmin()
  return db
    .select({ log: auditLogs, actorName: user.name, actorEmail: user.email })
    .from(auditLogs)
    .leftJoin(user, eq(auditLogs.actorId, user.id))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit)
}
