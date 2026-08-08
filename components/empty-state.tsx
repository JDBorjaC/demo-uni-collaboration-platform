import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string
  description: string
  actionHref?: string
  actionLabel?: string
}) {
  return (
    <Card className="flex flex-col items-center gap-2 border-dashed p-8 text-center">
      <p className="font-medium text-foreground">{title}</p>
      <p className="max-w-xs text-sm text-muted-foreground">{description}</p>
      {actionHref && actionLabel && (
        <Button
          render={<Link href={actionHref} />}
          nativeButton={false}
          variant="outline"
          size="sm"
          className="mt-2"
        >
          {actionLabel}
        </Button>
      )}
    </Card>
  )
}
