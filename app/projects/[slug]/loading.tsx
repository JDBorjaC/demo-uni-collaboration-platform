import { Skeleton } from "@/components/ui/skeleton"

export default function ProjectDetailLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Nav skeleton */}
      <div className="h-16 border-b border-border/60" />

      {/* Hero skeleton */}
      <div className="border-b border-border/50 px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-4 flex gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
          <Skeleton className="mb-3 h-10 w-3/4 rounded-xl" />
          <Skeleton className="mb-2 h-5 w-full max-w-2xl rounded-lg" />
          <Skeleton className="mb-8 h-5 w-2/3 max-w-xl rounded-lg" />
          <div className="mb-8 flex gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-40 rounded-lg" />
            <Skeleton className="h-10 w-36 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Content grid skeleton */}
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="flex flex-col gap-8 lg:col-span-2">
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <Skeleton className="mb-4 h-6 w-48" />
              <Skeleton className="mb-2 h-4 w-full" />
              <Skeleton className="mb-2 h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <Skeleton className="mb-4 h-6 w-36" />
              <Skeleton className="mb-2 h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-border/50 bg-card p-5">
              <Skeleton className="mb-4 h-4 w-32" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-36" />
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card p-5">
              <Skeleton className="mb-4 h-4 w-20" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="mb-3 flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
