"use client"

import { useState, useTransition, useMemo } from "react"
import { revertAuditEntry } from "@/app/actions/admin"
import {
  Search,
  RotateCcw,
  AlertTriangle,
  X,
  Loader2,
  ChevronRight,
  FileText,
  User,
  FolderOpen,
  Shield,
  ScrollText,
  CheckCircle2,
} from "lucide-react"
import { toast } from "sonner"

// ─── Types ────────────────────────────────────────────────────────────────────

type AuditLog = {
  id: string
  actorId: string | null
  action: string
  entityType: string
  entityId: string
  reason: string | null
  previousData: unknown
  metadata: unknown
  createdAt: Date | string
}

type LogRow = {
  log: AuditLog
  actorName: string | null
  actorEmail: string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: Date | string | null) {
  if (!d) return "—"
  const date = new Date(d)
  return date.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatRelative(d: Date | string | null): string {
  if (!d) return "—"
  const diff = Date.now() - new Date(d).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Ahora"
  if (mins < 60) return `hace ${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `hace ${hrs}h`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `hace ${days}d`
  return formatDate(d)
}

const actionLabels: Record<string, string> = {
  "project.created": "Proyecto creado",
  "project.updated": "Proyecto actualizado",
  "project.status_changed": "Estado cambiado",
  "project.submitted_for_review": "Enviado a revisión",
  "project.approved": "Proyecto aprobado",
  "project.rejected": "Proyecto rechazado",
  "project.archived": "Proyecto archivado",
  "project.deleted": "Proyecto eliminado",
  "application.approved": "Postulación aprobada",
  "application.rejected": "Postulación rechazada",
  "contribution.approved": "Contribución aprobada",
  "contribution.rejected": "Contribución rechazada",
  "contribution.withdrawn": "Contribución retirada",
  "profile.role_updated": "Rol actualizado",
  "profile.verification_updated": "Verificación actualizada",
  "audit.reverted": "Reversión aplicada",
}

const entityIcon: Record<string, React.ElementType> = {
  project: FolderOpen,
  profile: User,
  application: FileText,
  contribution: CheckCircle2,
  audit: Shield,
}

const actionColor: Record<string, string> = {
  "project.created": "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  "project.approved": "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  "project.submitted_for_review": "text-amber-400 bg-amber-500/10 border-amber-500/20",
  "project.rejected": "text-red-400 bg-red-500/10 border-red-500/20",
  "project.archived": "text-neutral-400 bg-neutral-700/30 border-neutral-600/30",
  "application.approved": "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  "application.rejected": "text-red-400 bg-red-500/10 border-red-500/20",
  "contribution.approved": "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  "contribution.rejected": "text-red-400 bg-red-500/10 border-red-500/20",
  "profile.role_updated": "text-violet-400 bg-violet-500/10 border-violet-500/20",
  "profile.verification_updated": "text-sky-400 bg-sky-500/10 border-sky-500/20",
  "audit.reverted": "text-orange-400 bg-orange-500/10 border-orange-500/20",
}

// ─── Revert Dialog ────────────────────────────────────────────────────────────

function RevertDialog({
  log,
  onClose,
  onReverted,
}: {
  log: AuditLog
  onClose: () => void
  onReverted: () => void
}) {
  const [reason, setReason] = useState("")
  const [isPending, startTransition] = useTransition()
  const hasPreviousData =
    log.previousData !== null &&
    log.previousData !== undefined &&
    typeof log.previousData === "object" &&
    Object.keys(log.previousData as object).length > 0

  function handleSubmit() {
    if (reason.trim().length < 5) {
      toast.error("El motivo debe tener al menos 5 caracteres")
      return
    }
    startTransition(async () => {
      const res = await revertAuditEntry({ auditLogId: log.id, reason: reason.trim() })
      if (res.success) {
        toast.success("Reversión aplicada correctamente")
        onReverted()
        onClose()
      } else {
        toast.error(res.error)
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-neutral-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-orange-500/10">
              <RotateCcw className="size-4 text-orange-400" />
            </div>
            <h2 className="text-base font-semibold text-white">Revertir Registro</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            className="rounded-lg p-1 text-neutral-500 hover:bg-white/5 hover:text-neutral-300"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Info */}
        <div className="mb-4 rounded-xl border border-white/8 bg-white/3 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-500">Acción</span>
            <span className="font-medium text-neutral-200">{actionLabels[log.action] ?? log.action}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-500">Entidad</span>
            <span className="font-mono text-neutral-400">{log.entityType} · {log.entityId.slice(0, 12)}…</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-500">Datos previos</span>
            <span className={`font-medium ${hasPreviousData ? "text-emerald-400" : "text-neutral-600"}`}>
              {hasPreviousData ? "Disponibles (se restaurarán)" : "No disponibles"}
            </span>
          </div>
        </div>

        {!hasPreviousData && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/8 p-3">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-400" />
            <p className="text-xs text-amber-300">
              Este registro no tiene datos previos. La reversión solo quedará documentada en el log de auditoría, sin cambios en los datos.
            </p>
          </div>
        )}

        {/* Reason input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
            Motivo de la reversión <span className="text-red-400">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explica por qué se revierte esta acción…"
            maxLength={500}
            rows={3}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-neutral-200 placeholder-neutral-600 outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30"
          />
          <div className="flex justify-end">
            <span className="text-[10px] text-neutral-600">{reason.length}/500</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={isPending || reason.trim().length < 5}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-600/80 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <RotateCcw className="size-4" />}
            Confirmar reversión
          </button>
          <button
            onClick={onClose}
            disabled={isPending}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-neutral-400 hover:bg-white/10"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Log Row ──────────────────────────────────────────────────────────────────

function LogRow({ row, onRevert }: { row: LogRow; onRevert: (log: AuditLog) => void }) {
  const { log } = row
  const EIcon = entityIcon[log.entityType] ?? ScrollText
  const colorCls = actionColor[log.action] ?? "text-neutral-400 bg-neutral-700/30 border-neutral-600/30"
  const canRevert = log.action !== "audit.reverted"

  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/6 bg-neutral-900/40 px-4 py-3 transition-all hover:border-white/10 hover:bg-neutral-900/60">
      {/* Entity icon */}
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-white/5">
        <EIcon className="size-3.5 text-neutral-500" />
      </div>

      {/* Action badge */}
      <div className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-semibold ${colorCls}`}>
        {actionLabels[log.action] ?? log.action}
      </div>

      {/* Entity + actor info */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="text-xs font-medium text-neutral-300 capitalize">{log.entityType}</span>
          <ChevronRight className="size-3 text-neutral-600" />
          <span className="font-mono text-[10px] text-neutral-600">{log.entityId.slice(0, 16)}…</span>
        </div>
        <p className="mt-0.5 text-[10px] text-neutral-600">
          por{" "}
          <span className="text-neutral-500">{row.actorName ?? "Sistema"}</span>
          {row.actorEmail && <span className="text-neutral-700"> · {row.actorEmail}</span>}
        </p>
      </div>

      {/* Timestamp */}
      <div className="shrink-0 text-right">
        <p className="text-[10px] font-medium text-neutral-500">{formatRelative(log.createdAt)}</p>
        <p className="text-[9px] text-neutral-700">{formatDate(log.createdAt)}</p>
      </div>

      {/* Revert button */}
      {canRevert && (
        <button
          onClick={() => onRevert(log)}
          title="Revertir este cambio"
          className="shrink-0 rounded-lg p-1.5 text-neutral-600 transition-colors hover:bg-orange-500/10 hover:text-orange-400"
        >
          <RotateCcw className="size-3.5" />
        </button>
      )}
      {!canRevert && <div className="size-7 shrink-0" />}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AdminAuditLogs({ logs }: { logs: LogRow[] }) {
  const [query, setQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [revertTarget, setRevertTarget] = useState<AuditLog | null>(null)
  const [revertedIds, setRevertedIds] = useState<Set<string>>(new Set())

  const entityTypes = useMemo(() => {
    const types = new Set(logs.map((r) => r.log.entityType))
    return Array.from(types).sort()
  }, [logs])

  const filtered = useMemo(() => {
    let list = logs.filter((r) => !revertedIds.has(r.log.id))
    const q = query.toLowerCase().trim()
    if (q) {
      list = list.filter(
        (r) =>
          r.log.action.toLowerCase().includes(q) ||
          (actionLabels[r.log.action] ?? "").toLowerCase().includes(q) ||
          r.log.entityType.toLowerCase().includes(q) ||
          r.log.entityId.toLowerCase().includes(q) ||
          (r.actorName ?? "").toLowerCase().includes(q) ||
          (r.actorEmail ?? "").toLowerCase().includes(q),
      )
    }
    if (filterType !== "all") {
      list = list.filter((r) => r.log.entityType === filterType)
    }
    return list
  }, [logs, query, filterType, revertedIds])

  function handleReverted() {
    if (revertTarget) {
      setRevertedIds((prev) => new Set(prev).add(revertTarget.id))
    }
  }

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar acción, entidad, actor…"
            className="h-10 w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-4 text-sm text-neutral-200 placeholder-neutral-600 outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/30"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="h-10 rounded-xl border border-white/10 bg-neutral-900 px-3 text-sm text-neutral-300 outline-none focus:border-sky-500/50"
        >
          <option value="all">Todos los tipos</option>
          {entityTypes.map((t) => (
            <option key={t} value={t} className="capitalize">
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Count */}
      <p className="text-xs text-neutral-600">
        Mostrando {filtered.length} de {logs.length} registros
      </p>

      {/* Log list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/8 bg-neutral-900/40 py-16 text-center">
          <ScrollText className="mb-3 size-8 text-neutral-700" />
          <p className="text-sm font-medium text-neutral-400">Sin registros</p>
          <p className="mt-1 text-xs text-neutral-600">No hay eventos de auditoría que coincidan con tu búsqueda</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {filtered.map((row) => (
            <LogRow key={row.log.id} row={row} onRevert={setRevertTarget} />
          ))}
        </div>
      )}

      {/* Revert dialog */}
      {revertTarget && (
        <RevertDialog
          log={revertTarget}
          onClose={() => setRevertTarget(null)}
          onReverted={handleReverted}
        />
      )}
    </>
  )
}
