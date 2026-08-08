import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { profiles } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"

export type Role = "student" | "faculty" | "admin"
export type ProjectRole = "leader" | "manager" | "contributor"

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message)
    this.name = "UnauthorizedError"
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Forbidden") {
    super(message)
    this.name = "ForbiddenError"
  }
}

/** Returns the current session's userId, or throws UnauthorizedError. */
export async function getUserId(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new UnauthorizedError()
  return session.user.id
}

/** Returns the current session's user + profile, or throws UnauthorizedError. */
export async function getCurrentUserWithProfile() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new UnauthorizedError()

  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, session.user.id)).limit(1)

  return { user: session.user, profile: profile ?? null }
}

/** Throws ForbiddenError unless the current user's profile role is admin. */
export async function requireAdmin() {
  const { user, profile } = await getCurrentUserWithProfile()
  if (profile?.role !== "admin") throw new ForbiddenError("Admin access required")
  return user.id
}

/** Throws ForbiddenError unless the current user's profile role is faculty or admin. */
export async function requireFacultyOrAdmin() {
  const { user, profile } = await getCurrentUserWithProfile()
  if (profile?.role !== "faculty" && profile?.role !== "admin") {
    throw new ForbiddenError("Faculty or admin access required")
  }
  return user.id
}

export function isProjectLeaderOrManager(role: ProjectRole | undefined | null) {
  return role === "leader" || role === "manager"
}
