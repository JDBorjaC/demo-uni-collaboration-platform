"use client"

import { useState, useTransition } from "react"
import { reviewProject } from "@/app/actions/projects"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  User,
  Tag,
  Building2,
  Calendar,
  Users,
  Inbox,
  AlertTriangle,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"

type Project = {
  id: string
  title: string
  summary: string
  description: string
  objectives: string | null
  collaborationNeeds: string[] | null
  status: string
  visibility: string
  maxMembers: number
  coverImageUrl: string | null
  createdAt: Date | string
  updatedAt: Date | string
  leaderId: string
  slug: string
  categoryId: string | null
  universityAffiliationId: string | null
}

type PendingProject = {
  project: Project
  leaderName: string | null
  leaderEmail: string | null
  categoryName: string | null
  affiliationName: string | null
}

function formatDate(d: Date | string | null) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "numeric" })
}

function ProjectCard({ row, onReviewed }: { row: PendingProject; onReviewed: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false)
  const [mode, setMode] = useState<"idle" | "approve" | "reject">("idle")
  const [comment, setComment] = useState("")
  const [isPending, startTransition] = useTransition()

  function handleDecision(decision: "approved" | "rejected") {
    startTransition(async () => {
      const res = await reviewProject({
        id: row.project.id,
        decision,
        comment: comment.trim() || undefined,
      })
      if (res.success) {
        toast.success(decision === "approved" ? "Proyecto aprobado y publicado" : "Proyecto rechazado con comentario")
        onReviewed(row.project.id)
      } else {
        toast.error(res.error)
      }
    })
  }

  return (
    <div className="rounded-2xl border border-white/8 bg-neutral-900/60 transition-all hover:border-white/12">
      {/* Card header */}
      <div className="flex items-start gap-4 p-5">
        {/* Cover / Icon */}
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
          {row.project.coverImageUrl ? (
            <img
              src={row.project.coverImageUrl}
              alt=""
              className="size-12 rounded-xl object-cover"
            />
          ) : (
            <AlertTriangle className="size-5 text-amber-400" />
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold text-white">{row.project.title}</h3>
            <Badge className="border border-amber-500/25 bg-amber-500/10 text-[10px] font-semibold uppercase tracking-wide text-amber-300">
              pending review
            </Badge>
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-neutral-400">{row.project.summary}</p>

          {/* Meta row */}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
            <span className="flex items-center gap-1.5 text-xs text-neutral-500">
              <User className="size-3" />
              {row.leaderName ?? "Unknown"} · {row.leaderEmail}
            </span>
            {row.categoryName && (
              <span className="flex items-center gap-1.5 text-xs text-neutral-500">
                <Tag className="size-3" />
                {row.categoryName}
              </span>
            )}
            {row.affiliationName && (
              <span className="flex items-center gap-1.5 text-xs text-neutral-500">
                <Building2 className="size-3" />
                {row.affiliationName}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-xs text-neutral-500">
              <Users className="size-3" />
              Máx. {row.project.maxMembers} miembros
            </span>
            <span className="flex items-center gap-1.5 text-xs text-neutral-500">
              <Calendar className="size-3" />
              Enviado {formatDate(row.project.updatedAt)}
            </span>
          </div>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="shrink-0 rounded-lg p-2 text-neutral-500 transition-colors hover:bg-white/5 hover:text-neutral-300"
          aria-label={expanded ? "Colapsar" : "Ver detalles"}
        >
          {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-white/6 px-5 pb-5 pt-4 space-y-4">
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-neutral-500">Descripción</p>
            <p className="text-sm leading-relaxed text-neutral-300 whitespace-pre-line">{row.project.description}</p>
          </div>

          {row.project.objectives && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-neutral-500">Objetivos</p>
              <p className="text-sm leading-relaxed text-neutral-300 whitespace-pre-line">{row.project.objectives}</p>
            </div>
          )}

          {row.project.collaborationNeeds && row.project.collaborationNeeds.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-neutral-500">
                Necesidades de Colaboración
              </p>
              <div className="flex flex-wrap gap-2">
                {row.project.collaborationNeeds.map((need) => (
                  <span
                    key={need}
                    className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-0.5 text-xs text-violet-300"
                  >
                    {need}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Decision zone */}
      <div className="border-t border-white/6 p-5">
        {mode === "idle" && (
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => setMode("approve")}
              disabled={isPending}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
            >
              <CheckCircle2 className="size-4" />
              Aprobar y publicar
            </Button>
            <Button
              onClick={() => setMode("reject")}
              disabled={isPending}
              className="flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-5 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/20"
            >
              <XCircle className="size-4" />
              Rechazar
            </Button>
          </div>
        )}

        {mode === "approve" && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-emerald-300">
              ¿Confirmas publicar este proyecto? (Opcional: deja un comentario para el líder)
            </p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Comentario opcional para el líder del proyecto…"
              maxLength={1000}
              rows={2}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-neutral-200 placeholder-neutral-600 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
            />
            <div className="flex gap-2">
              <Button
                onClick={() => handleDecision("approved")}
                disabled={isPending}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
              >
                {isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                Confirmar aprobación
              </Button>
              <Button
                onClick={() => { setMode("idle"); setComment("") }}
                disabled={isPending}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-neutral-400 hover:bg-white/10"
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {mode === "reject" && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-red-300">
              Proporciona retroalimentación al líder del proyecto sobre por qué fue rechazado:
            </p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Explica las razones del rechazo y qué debe mejorar…"
              maxLength={1000}
              rows={3}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-neutral-200 placeholder-neutral-600 outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30"
            />
            <div className="flex gap-2">
              <Button
                onClick={() => handleDecision("rejected")}
                disabled={isPending}
                className="flex items-center gap-2 rounded-xl bg-red-600/80 px-5 py-2 text-sm font-semibold text-white hover:bg-red-600"
              >
                {isPending ? <Loader2 className="size-4 animate-spin" /> : <XCircle className="size-4" />}
                Confirmar rechazo
              </Button>
              <Button
                onClick={() => { setMode("idle"); setComment("") }}
                disabled={isPending}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-neutral-400 hover:bg-white/10"
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function ModerationQueue({ projects }: { projects: PendingProject[] }) {
  const [list, setList] = useState(projects)

  function handleReviewed(id: string) {
    setList((prev) => prev.filter((p) => p.project.id !== id))
  }

  if (list.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-white/8 bg-neutral-900/40 py-20 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-emerald-500/10">
          <Inbox className="size-7 text-emerald-400" />
        </div>
        <p className="text-base font-semibold text-neutral-200">Cola vacía</p>
        <p className="mt-1 max-w-xs text-sm text-neutral-500">
          No hay proyectos pendientes de revisión en este momento. ¡Buen trabajo!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {list.map((row) => (
        <ProjectCard key={row.project.id} row={row} onReviewed={handleReviewed} />
      ))}
    </div>
  )
}
