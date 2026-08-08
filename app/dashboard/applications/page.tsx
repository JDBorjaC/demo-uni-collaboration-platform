import Link from "next/link"
import { getMyApplications } from "@/app/actions/applications"
import { Card } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { EmptyState } from "@/components/empty-state"
import { WithdrawApplicationButton } from "@/components/withdraw-application-button"

export default async function MyApplicationsPage() {
  const applications = await getMyApplications()

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">My applications</h1>
      <p className="mt-1 text-sm text-muted-foreground">Collaboration requests you've sent to project leaders.</p>

      <div className="mt-6">
        {applications.length === 0 ? (
          <EmptyState
            title="No applications yet"
            description="Browse published projects and apply to collaborate."
            actionHref="/projects"
            actionLabel="Browse projects"
          />
        ) : (
          <div className="flex flex-col gap-3">
            {applications.map((a) => (
              <Card key={a.application.id} className="flex flex-col gap-3 p-4">
                <div className="flex items-center justify-between gap-3">
                  <Link href={`/projects/${a.project.slug}`} className="font-medium text-foreground hover:underline">
                    {a.project.title}
                  </Link>
                  <StatusBadge status={a.application.status} />
                </div>
                <p className="text-sm text-muted-foreground">{a.application.message}</p>
                {a.application.status === "pending" && (
                  <div>
                    <WithdrawApplicationButton applicationId={a.application.id} />
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
