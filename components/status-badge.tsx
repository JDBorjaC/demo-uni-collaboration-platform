import { Badge } from "@/components/ui/badge"

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
  pending_review: { label: "Pending review", className: "bg-chart-4/20 text-chart-4" },
  published: { label: "Published", className: "bg-accent/20 text-accent" },
  rejected: { label: "Rejected", className: "bg-destructive/15 text-destructive" },
  archived: { label: "Archived", className: "bg-muted text-muted-foreground" },
  pending: { label: "Pending", className: "bg-chart-4/20 text-chart-4" },
  approved: { label: "Approved", className: "bg-accent/20 text-accent" },
  withdrawn: { label: "Withdrawn", className: "bg-muted text-muted-foreground" },
  submitted: { label: "Submitted", className: "bg-chart-4/20 text-chart-4" },
  verified: { label: "Verified", className: "bg-accent/20 text-accent" },
}

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? { label: status, className: "bg-muted text-muted-foreground" }
  return <Badge className={`border-transparent font-medium ${config.className}`}>{config.label}</Badge>
}
