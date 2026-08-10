import Link from "next/link"
import { getMyProjects } from "@/app/actions/projects"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { EmptyState } from "@/components/empty-state"
import { Plus } from "lucide-react"

export default async function MyProjectsPage() {
  const projects = await getMyProjects()

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">My projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">Projects you lead, from draft to published.</p>
        </div>
        <Button render={<Link href="/dashboard/projects/new" />} nativeButton={false}>
          <Plus className="size-4" />
          New project
        </Button>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create your first project and invite collaborators once it's published."
          actionHref="/dashboard/projects/new"
          actionLabel="Create project"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {projects.map((p) => (
            <Link key={p.id} href={`/dashboard/projects/${p.id}`}>
              <Card className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-secondary/50">
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{p.title}</p>
                  <p className="truncate text-sm text-muted-foreground">{p.summary}</p>
                </div>
                <StatusBadge status={p.status} />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
