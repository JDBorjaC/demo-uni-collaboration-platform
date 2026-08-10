import Link from "next/link"
import { getMyContributions } from "@/app/actions/contributions"
import { getMyMemberships } from "@/app/actions/projects"
import { Card } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { EmptyState } from "@/components/empty-state"
import { WithdrawContributionButton } from "@/components/withdraw-contribution-button"
import { NewContributionDialog } from "@/components/new-contribution-dialog"
import { EditContributionDialog } from "@/components/edit-contribution-dialog"
import { ExternalLink } from "lucide-react"

const CONTRIBUTION_TYPE_LABELS: Record<string, string> = {
  update: "Update",
  milestone: "Milestone",
  resource: "Resource",
  report: "Report",
}

const CONTRIBUTION_TYPE_COLORS: Record<string, string> = {
  update: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  milestone: "bg-green-500/10 text-green-600 dark:text-green-400",
  resource: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  report: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
}

export default async function MyContributionsPage() {
  const [contributions, memberships] = await Promise.all([getMyContributions(), getMyMemberships()])

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">My contributions</h1>
          <p className="mt-1 text-sm text-muted-foreground">Work you've submitted to projects you're part of.</p>
        </div>
        {memberships.length > 0 && (
          <NewContributionDialog projects={memberships.map((m) => ({ id: m.project.id, title: m.project.title }))} />
        )}
      </div>

      {contributions.length === 0 ? (
        <EmptyState
          title="No contributions yet"
          description="Submit work to a project you're a member of for leader review."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {contributions.map((c) => {
            const typeLabel = CONTRIBUTION_TYPE_LABELS[c.contribution.type] ?? c.contribution.type
            const typeColor =
              CONTRIBUTION_TYPE_COLORS[c.contribution.type] ?? "bg-muted text-muted-foreground"

            return (
              <Card key={c.contribution.id} className="flex flex-col gap-3 p-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex flex-col gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-foreground">{c.contribution.title}</p>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${typeColor}`}
                      >
                        {typeLabel}
                      </span>
                    </div>
                    <Link
                      href={`/projects/${c.project.slug}`}
                      className="text-sm text-muted-foreground hover:underline"
                    >
                      {c.project.title}
                    </Link>
                  </div>
                  <StatusBadge status={c.contribution.status} />
                </div>

                {/* Description */}
                <p className="text-sm text-foreground/80 leading-relaxed">{c.contribution.description}</p>

                {/* External link */}
                {c.contribution.contentUrl && (
                  <a
                    href={c.contribution.contentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                  >
                    <ExternalLink className="size-3.5" />
                    View attached resource
                  </a>
                )}

                {/* Actions — only for submitted */}
                {c.contribution.status === "submitted" && (
                  <div className="flex items-center gap-2">
                    <EditContributionDialog contribution={c.contribution} />
                    <WithdrawContributionButton contributionId={c.contribution.id} />
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
