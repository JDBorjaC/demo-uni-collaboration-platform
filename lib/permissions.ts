import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { profiles } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"

export type Role =
  | "student"
  | "project_leader"
  | "collaborator"
  | "moderator"
  | "admin"
  | "external_expert"
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

/** Throws ForbiddenError unless the current user's profile role is moderator or admin. */
export async function requireModeratorOrAdmin() {
  const { user, profile } = await getCurrentUserWithProfile()
  if (profile?.role !== "moderator" && profile?.role !== "admin") {
    throw new ForbiddenError("Moderator or admin access required")
  }
  return user.id
}

/** Throws ForbiddenError unless the current user's profile role is leader, moderator, or admin. */
export async function requireLeaderModeratorOrAdmin() {
  const { user, profile } = await getCurrentUserWithProfile()
  if (profile?.role !== "project_leader" && profile?.role !== "moderator" && profile?.role !== "admin") {
    throw new ForbiddenError("Leader, moderator, or admin access required")
  }
  return user.id
}

export function isAdmin(role?: Role | string | null) {
  return role === "admin"
}

export function isModerator(role?: Role | string | null) {
  return role === "moderator" || role === "admin"
}

export function isProjectLeader(userId: string, projectLeaderId: string) {
  return userId === projectLeaderId
}

export function isProjectLeaderOrManager(role: ProjectRole | undefined | null) {
  return role === "leader" || role === "manager"
}

export function canApproveContribution(
  userId: string,
  projectLeaderId: string,
  reviewerRoleInProject?: ProjectRole | undefined | null,
) {
  return userId === projectLeaderId || isProjectLeaderOrManager(reviewerRoleInProject)
}
