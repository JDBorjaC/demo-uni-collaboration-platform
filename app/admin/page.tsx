import { db } from "@/lib/db"
import { auditLogs, profiles, projects, user } from "@/lib/db/schema"
import { count, eq, gte } from "drizzle-orm"
import {
  Users,
  ShieldAlert,
  FolderOpen,
  ActivitySquare,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"

async function getAdminMetrics() {
  const [totalUsersResult] = await db.select({ count: count() }).from(user)

  const [pendingReviewResult] = await db
    .select({ count: count() })
    .from(projects)
    .where(eq(projects.status, "pending_review"))

  const [publishedProjectsResult] = await db
    .select({ count: count() })
    .from(projects)
    .where(eq(projects.status, "published"))

  const [draftProjectsResult] = await db
    .select({ count: count() })
    .from(projects)
    .where(eq(projects.status, "draft"))

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const [recentAuditResult] = await db
    .select({ count: count() })
    .from(auditLogs)
    .where(gte(auditLogs.createdAt, oneDayAgo))

  const [pendingVerificationResult] = await db
    .select({ count: count() })
    .from(profiles)
    .where(eq(profiles.verificationStatus, "pending"))

  const recentAuditLogs = await db
    .select({ log: auditLogs })
    .from(auditLogs)
    .orderBy(auditLogs.createdAt)
    .limit(8)

  return {
    totalUsers: totalUsersResult?.count ?? 0,
    pendingReview: pendingReviewResult?.count ?? 0,
    publishedProjects: publishedProjectsResult?.count ?? 0,
    draftProjects: draftProjectsResult?.count ?? 0,
    recentAuditCount: recentAuditResult?.count ?? 0,
    pendingVerification: pendingVerificationResult?.count ?? 0,
    recentAuditLogs,
  }
}

function formatRelativeTime(date: Date | string | null): string {
  if (!date) return "—"
  const d = new Date(date)
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Ahora"
  if (mins < 60) return `hace ${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `hace ${hrs}h`
  const days = Math.floor(hrs / 24)
  return `hace ${days}d`
}

function getActionLabel(action: string): string {
  const labels: Record<string, string> = {
    "project.created": "Proyecto creado",
    "project.updated": "Proyecto actualizado",
    "project.status_changed": "Estado de proyecto cambiado",
    "project.deleted": "Proyecto eliminado",
    "application.approved": "Postulación aprobada",
    "application.rejected": "Postulación rechazada",
    "contribution.approved": "Contribución aprobada",
    "contribution.rejected": "Contribución rechazada",
    "profile.role_updated": "Rol de usuario actualizado",
    "profile.verification_updated": "Verificación de perfil actualizada",
  }
  return labels[action] ?? action
}

export default async function AdminPage() {
  const metrics = await getAdminMetrics()

  const metricCards = [
    {
      label: "Usuarios Registrados",
      value: metrics.totalUsers,
      icon: Users,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
      border: "border-violet-500/20",
      description: `${metrics.pendingVerification} pendientes de verificar`,
      descriptionColor: metrics.pendingVerification > 0 ? "text-amber-400" : "text-neutral-500",
    },
    {
      label: "En Revisión",
      value: metrics.pendingReview,
      icon: ShieldAlert,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      description: "Proyectos esperando moderación",
      descriptionColor: metrics.pendingReview > 0 ? "text-amber-400" : "text-neutral-500",
      urgent: metrics.pendingReview > 0,
    },
    {
      label: "Proyectos Publicados",
      value: metrics.publishedProjects,
      icon: FolderOpen,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      description: `${metrics.draftProjects} borradores`,
      descriptionColor: "text-neutral-500",
    },
    {
      label: "Actividad (24h)",
      value: metrics.recentAuditCount,
      icon: ActivitySquare,
      color: "text-sky-400",
      bg: "bg-sky-500/10",
      border: "border-sky-500/20",
      description: "Eventos de auditoría recientes",
      descriptionColor: "text-neutral-500",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Panel de Administración</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Vista general de la plataforma en tiempo real.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5">
          <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
          <span className="text-xs font-medium text-emerald-400">Sistema activo</span>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <div
            key={card.label}
            className={`relative overflow-hidden rounded-2xl border ${card.border} bg-neutral-900/60 p-5 backdrop-blur transition-all hover:bg-neutral-900/80`}
          >
            {card.urgent && (
              <span className="absolute right-3 top-3 flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-amber-500" />
              </span>
            )}
            <div className={`mb-4 inline-flex rounded-xl p-2.5 ${card.bg}`}>
              <card.icon className={`size-5 ${card.color}`} />
            </div>
            <p className="text-3xl font-bold tracking-tight text-white">{card.value}</p>
            <p className="mt-1 text-sm font-medium text-neutral-300">{card.label}</p>
            <p className={`mt-1 text-xs ${card.descriptionColor}`}>{card.description}</p>
          </div>
        ))}
      </div>

      {/* Quick access */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Quick actions */}
        <div className="rounded-2xl border border-white/8 bg-neutral-900/60 p-6">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="size-4 text-violet-400" />
            <h2 className="text-sm font-semibold text-white">Acciones Rápidas</h2>
          </div>
          <div className="space-y-2">
            <a
              href="/admin/moderation"
              className="group flex items-center justify-between rounded-xl border border-white/5 bg-white/3 px-4 py-3 transition-all hover:border-amber-500/25 hover:bg-amber-500/5"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10">
                  <ShieldAlert className="size-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-200">Revisar proyectos</p>
                  <p className="text-xs text-neutral-500">
                    {metrics.pendingReview > 0
                      ? `${metrics.pendingReview} esperando revisión`
                      : "Sin proyectos pendientes"}
                  </p>
                </div>
              </div>
              <ShieldAlert className="size-4 text-neutral-600 transition-colors group-hover:text-amber-400" />
            </a>

            <a
              href="/admin/users"
              className="group flex items-center justify-between rounded-xl border border-white/5 bg-white/3 px-4 py-3 transition-all hover:border-violet-500/25 hover:bg-violet-500/5"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-violet-500/10">
                  <Users className="size-4 text-violet-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-200">Gestionar usuarios</p>
                  <p className="text-xs text-neutral-500">
                    {metrics.pendingVerification > 0
                      ? `${metrics.pendingVerification} verificaciones pendientes`
                      : "Sin verificaciones pendientes"}
                  </p>
                </div>
              </div>
              <Users className="size-4 text-neutral-600 transition-colors group-hover:text-violet-400" />
            </a>

            <a
              href="/admin/audit-logs"
              className="group flex items-center justify-between rounded-xl border border-white/5 bg-white/3 px-4 py-3 transition-all hover:border-sky-500/25 hover:bg-sky-500/5"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-sky-500/10">
                  <ActivitySquare className="size-4 text-sky-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-200">Ver registros de auditoría</p>
                  <p className="text-xs text-neutral-500">
                    {metrics.recentAuditCount} eventos en las últimas 24h
                  </p>
                </div>
              </div>
              <ActivitySquare className="size-4 text-neutral-600 transition-colors group-hover:text-sky-400" />
            </a>
          </div>
        </div>

        {/* Recent audit log feed */}
        <div className="rounded-2xl border border-white/8 bg-neutral-900/60 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-neutral-400" />
              <h2 className="text-sm font-semibold text-white">Actividad Reciente</h2>
            </div>
            <a
              href="/admin/audit-logs"
              className="text-xs text-neutral-500 transition-colors hover:text-neutral-300"
            >
              Ver todos →
            </a>
          </div>

          {metrics.recentAuditLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle2 className="mb-2 size-8 text-neutral-700" />
              <p className="text-sm text-neutral-500">Sin actividad reciente registrada</p>
            </div>
          ) : (
            <div className="space-y-1">
              {metrics.recentAuditLogs.map(({ log }) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/3"
                >
                  <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-neutral-800">
                    <AlertCircle className="size-3 text-neutral-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-neutral-200">
                      {getActionLabel(log.action)}
                    </p>
                    <p className="text-[10px] text-neutral-600">
                      {log.entityType} · {formatRelativeTime(log.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
