"use server"

import { db } from "@/lib/db"
import { profiles, universityAffiliations } from "@/lib/db/schema"
import { getUserId } from "@/lib/permissions"
import { logAudit } from "@/lib/audit"
import { onboardingSchema } from "@/lib/validations"
import { eq } from "drizzle-orm"
import { nanoid } from "nanoid"
import { revalidatePath } from "next/cache"

export async function getUniversityAffiliations() {
  return db.select().from(universityAffiliations).orderBy(universityAffiliations.name)
}

export async function getMyProfile() {
  const userId = await getUserId()
  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1)
  return profile ?? null
}

export type OnboardingResult = { success: true } | { success: false; error: string }

export async function completeOnboarding(input: unknown): Promise<OnboardingResult> {
  const userId = await getUserId()

  const parsed = onboardingSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }
  const { role, bio, universityAffiliationId, institutionalEmail } = parsed.data

  const [affiliation] = await db
    .select()
    .from(universityAffiliations)
    .where(eq(universityAffiliations.id, universityAffiliationId))
    .limit(1)

  if (!affiliation) {
    return { success: false, error: "Selected institution was not found" }
  }

  const domain = institutionalEmail.split("@")[1]?.toLowerCase()
  const isAllowedDomain = domain === affiliation.domain.toLowerCase()

  const existing = await getMyProfile()
  const now = new Date()

  if (existing) {
    await db
      .update(profiles)
      .set({
        role,
        bio: bio ?? null,
        universityAffiliationId,
        verificationStatus: isAllowedDomain ? "verified" : "pending",
        updatedAt: now,
      })
      .where(eq(profiles.userId, userId))
  } else {
    await db.insert(profiles).values({
      id: nanoid(),
      userId,
      role,
      bio: bio ?? null,
      universityAffiliationId,
      verificationStatus: isAllowedDomain ? "verified" : "pending",
    })
  }

  await logAudit({
    actorId: userId,
    action: existing ? "profile.updated" : "profile.created",
    entityType: "profile",
    entityId: userId,
    metadata: { role, verificationStatus: isAllowedDomain ? "verified" : "pending" },
  })

  revalidatePath("/dashboard")
  return { success: true }
}
