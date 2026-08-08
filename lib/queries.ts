import { db } from "@/lib/db"
import {
  categories,
  collaborationApplications,
  contributions,
  profiles,
  projectMembers,
  projects,
  user,
} from "@/lib/db/schema"
import { and, desc, eq, ilike, or } from "drizzle-orm"

export async function getCategories() {
  return db.select().from(categories).orderBy(categories.name)
}

export async function getPublishedProjects(params?: { query?: string; categoryId?: string }) {
  const conditions = [eq(projects.status, "published")]
  if (params?.categoryId) conditions.push(eq(projects.categoryId, params.categoryId))

  const rows = await db
    .select({
      project: projects,
      leaderName: user.name,
      categoryName: categories.name,
    })
    .from(projects)
    .innerJoin(user, eq(projects.leaderId, user.id))
    .leftJoin(categories, eq(projects.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(desc(projects.createdAt))

  if (params?.query) {
    const q = params.query.toLowerCase()
    return rows.filter(
      (r) => r.project.title.toLowerCase().includes(q) || r.project.summary.toLowerCase().includes(q),
    )
  }

  return rows
}

export async function getProjectBySlug(slug: string) {
  const [row] = await db
    .select({
      project: projects,
      leaderName: user.name,
      leaderEmail: user.email,
      categoryName: categories.name,
    })
    .from(projects)
    .innerJoin(user, eq(projects.leaderId, user.id))
    .leftJoin(categories, eq(projects.categoryId, categories.id))
    .where(eq(projects.slug, slug))
    .limit(1)
  return row ?? null
}

export async function getProjectMembers(projectId: string) {
  return db
    .select({ member: projectMembers, name: user.name, email: user.email, image: user.image })
    .from(projectMembers)
    .innerJoin(user, eq(projectMembers.userId, user.id))
    .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.status, "active")))
    .orderBy(projectMembers.joinedAt)
}

export async function getProjectApplications(projectId: string) {
  return db
    .select({ application: collaborationApplications, name: user.name, email: user.email })
    .from(collaborationApplications)
    .innerJoin(user, eq(collaborationApplications.applicantId, user.id))
    .where(eq(collaborationApplications.projectId, projectId))
    .orderBy(desc(collaborationApplications.createdAt))
}

export async function getProjectContributions(projectId: string) {
  return db
    .select({
      contribution: contributions,
      memberName: user.name,
      roleInProject: projectMembers.roleInProject,
    })
    .from(contributions)
    .innerJoin(projectMembers, eq(contributions.memberId, projectMembers.id))
    .innerJoin(user, eq(projectMembers.userId, user.id))
    .where(eq(contributions.projectId, projectId))
    .orderBy(desc(contributions.createdAt))
}

export async function getUserMembership(projectId: string, userId: string) {
  const [row] = await db
    .select()
    .from(projectMembers)
    .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)))
    .limit(1)
  return row ?? null
}

export async function searchProjects(q: string) {
  return db
    .select()
    .from(projects)
    .where(and(eq(projects.status, "published"), or(ilike(projects.title, `%${q}%`), ilike(projects.summary, `%${q}%`))))
    .orderBy(desc(projects.createdAt))
}

export async function getProfileByUserId(userId: string) {
  const [row] = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1)
  return row ?? null
}
