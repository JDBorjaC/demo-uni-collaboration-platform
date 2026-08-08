import Link from "next/link"
import { getMyProjects, getMyMemberships } from "@/app/actions/projects"
import { getMyApplications } from "@/app/actions/applications"
import { getMyContributions } from "@/app/actions/contributions"
import { getMyProfile } from "@/app/actions/onboarding"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { EmptyState } from "@/components/empty-state"
import { FolderKanban, Users, ClipboardCheck, FileCheck, Plus } from "lucide-react"

export default async function DashboardPage() {
  const [profile, myProjects, memberships, applications, contributions] = await Promise.all([
    getMyProfile(),
    getMyProjects(),
    getMyMemberships(),
    getMyApplications(),
    getMyContributions(),
  ])

  const pendingApplications = applications.filter((a) => a.application.status === "pending")
  const pendingContributions = contributions.filter((c) => c.contribution.status === "submitted")

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track your projects, applications, and contributions in one place.
          </p>
        </div>
        <Button render={<Link href="/dashboard/projects/new" />} nativeButton={false}>
          <Plus className="size-4" />
          New project
        </Button>
      </div>

      {profile?.verificationStatus === "pending" && (
        <Card className="mb-6 border-accent/40 bg-accent/10 p-4">
          <p className="text-sm text-foreground">
            Your institutional email is pending verification. An admin will review your account shortly. You can still
            browse and apply to projects.
          </p>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FolderKanban} label="Projects led" value={myProjects.length} />
        <StatCard icon={Users} label="Active memberships" value={memberships.length} />
        <StatCard icon={ClipboardCheck} label="Pending applications" value={pendingApplications.length} />
        <StatCard icon={FileCheck} label="Contributions in review" value={pendingContributions.length} />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">My projects</h2>
          {myProjects.length === 0 ? (
            <EmptyState
              title="No projects yet"
              description="Start your first collaborative research project."
              actionHref="/dashboard/projects/new"
              actionLabel="Create project"
            />
          ) : (
            <div className="flex flex-col gap-3">
              {myProjects.slice(0, 5).map((p) => (
                <Link key={p.id} href={`/dashboard/projects/${p.id}`}>
                  <Card className="flex items-center justify-between gap-3 p-4 transition-colors hover:bg-secondary/50">
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
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Memberships
          </h2>
          {memberships.length === 0 ? (
            <EmptyState
              title="Not part of any projects"
              description="Browse published projects and apply to collaborate."
              actionHref="/projects"
              actionLabel="Browse projects"
            />
          ) : (
            <div className="flex flex-col gap-3">
              {memberships.slice(0, 5).map((m) => (
                <Link key={m.member.id} href={`/projects/${m.project.slug}`}>
                  <Card className="flex items-center justify-between gap-3 p-4 transition-colors hover:bg-secondary/50">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{m.project.title}</p>
                      <p className="text-sm text-muted-foreground">Role: {m.member.roleInProject}</p>
                    </div>
                    <Badge variant="secondary" className="capitalize">
                      {m.member.roleInProject}
                    </Badge>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value }: { icon: typeof FolderKanban; label: string; value: number }) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-2xl font-semibold tabular-nums text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </Card>
  )
}
