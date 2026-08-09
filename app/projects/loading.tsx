import { Skeleton } from "@/components/ui/skeleton"

function ProjectCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl border border-border/50 bg-card shadow-sm">
      <Skeleton className="h-44 rounded-t-2xl rounded-b-none" />
      <div className="flex flex-col gap-3 p-5">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <div className="flex items-center justify-between border-t border-border/40 pt-3">
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    </div>
  )
}

export default function ProjectsLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header skeleton */}
      <div className="border-b border-border/60 bg-background/80 px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <Skeleton className="mb-2 h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        {/* Filters skeleton */}
        <div className="mb-8 flex flex-col gap-3">
          <Skeleton className="h-10 w-full rounded-md" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-48 rounded-md" />
            <Skeleton className="h-10 w-48 rounded-md" />
          </div>
        </div>

        {/* Results info skeleton */}
        <Skeleton className="mb-6 h-4 w-40" />

        {/* Grid skeleton */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
