import { Loader2 } from "lucide-react"

export default function DashboardLoading() {
  return (
    <div className="flex min-h-[400px] w-full flex-col items-center justify-center rounded-2xl border border-white/5 bg-neutral-900/20 sm:min-h-[500px]">
      <Loader2 className="mb-4 size-8 animate-spin text-violet-500" />
      <p className="text-sm font-medium text-neutral-400">Cargando información del panel...</p>
    </div>
  )
}
