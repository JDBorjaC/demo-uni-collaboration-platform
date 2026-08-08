import Link from "next/link"
import { getMyContributions } from "@/app/actions/contributions"
import { getMyMemberships } from "@/app/actions/projects"
import { Card } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { EmptyState } from "@/components/empty-state"
import { WithdrawContributionButton } from "@/components/withdraw-contribution-button"
import { NewContributionDialog } from "@/components/new-contribution-dialog"

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
          {contributions.map((c) => (
            <Card key={c.contribution.id} className="flex flex-col gap-3 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">{c.contribution.title}</p>
                  <Link href={`/projects/${c.project.slug}`} className="text-sm text-muted-foreground hover:underline">
                    {c.project.title}
                  </Link>
                </div>
                <StatusBadge status={c.contribution.status} />
              </div>
              <p className="text-sm text-foreground">{c.contribution.description}</p>
              {c.contribution.status === "submitted" && (
                <div>
                  <WithdrawContributionButton contributionId={c.contribution.id} />
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
