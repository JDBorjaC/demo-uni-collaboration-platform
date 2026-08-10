import { getPendingModerationProjects } from "@/app/actions/projects"
import { ModerationQueue } from "@/components/admin-moderation-queue"
import { ShieldCheck, Clock } from "lucide-react"

export const metadata = {
  title: "Moderación de Proyectos — Admin | Collab",
}

export default async function ModerationPage() {
  const pendingProjects = await getPendingModerationProjects()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-amber-400" />
            <h1 className="text-2xl font-bold tracking-tight text-white">Cola de Moderación</h1>
          </div>
          <p className="mt-1 text-sm text-neutral-400">
            Revisa y aprueba o rechaza proyectos enviados a revisión por sus líderes.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1.5">
          <Clock className="size-3.5 text-amber-400" />
          <span className="text-xs font-semibold text-amber-300">
            {pendingProjects.length} pendiente{pendingProjects.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Queue */}
      <ModerationQueue projects={pendingProjects} />
    </div>
  )
}
