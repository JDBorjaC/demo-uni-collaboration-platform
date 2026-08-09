import { notFound, redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { projects } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import {
  getProjectMembers,
  getProjectApplications,
  getProjectContributions,
  getCategories,
  getUniversityAffiliations,
} from "@/lib/queries"
import { ProjectManageTabs } from "@/components/project-manage-tabs"

export default async function ManageProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in")

  const [project] = await db.select().from(projects).where(eq(projects.id, id)).limit(1)
  if (!project) notFound()
  if (project.leaderId !== session.user.id) notFound()

  const [members, applications, contributions, categories, affiliations] = await Promise.all([
    getProjectMembers(project.id),
    getProjectApplications(project.id),
    getProjectContributions(project.id),
    getCategories(),
    getUniversityAffiliations(),
  ])

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <ProjectManageTabs
        project={project}
        members={members}
        applications={applications}
        contributions={contributions}
        categories={categories}
        affiliations={affiliations}
      />
    </div>
  )
}
