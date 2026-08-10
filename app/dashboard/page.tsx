import type { Metadata } from "next"
import Link from "next/link"
import { getMyProjects, getMyMemberships, getMySubscriptions } from "@/app/actions/projects"
import { getMyApplications } from "@/app/actions/applications"
import { getMyContributions } from "@/app/actions/contributions"
import { getMyProfile } from "@/app/actions/onboarding"
import { getMyNotifications } from "@/app/actions/notifications"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import {
  AlertCircle,
  ArrowRight,
  Bell,
  BookOpen,
  CheckCircle,
  ClipboardCheck,
  Clock,
  ExternalLink,
  FileCheck,
  FolderKanban,
  PlusCircle,
  Telescope,
  Users,
  XCircle,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Dashboard — Collab",
  description: "Tu panel de control en Collab. Gestiona tus proyectos, postulaciones y contribuciones.",
}

// ── helpers ──────────────────────────────────────────────────────────────────

function formatRelative(date: Date | string) {
  const d = new Date(date)
  const diff = Date.now() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return "ahora"
  if (minutes < 60) return `hace ${minutes}m`
  if (hours < 24) return `hace ${hours}h`
  return `hace ${days}d`
}

const applicationStatusConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  pending: { label: "Pendiente", icon: Clock, color: "text-amber-500" },
  approved: { label: "Aprobada", icon: CheckCircle, color: "text-emerald-500" },
  rejected: { label: "Rechazada", icon: XCircle, color: "text-rose-500" },
  withdrawn: { label: "Retirada", icon: XCircle, color: "text-zinc-400" },
}

const roleLabel: Record<string, string> = {
  leader: "Líder",
  manager: "Manager",
  contributor: "Colaborador",
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  href,
  color = "bg-primary/10 text-primary",
}: {
  icon: React.ElementType
  label: string
  value: number
  href?: string
  color?: string
}) {
  const inner = (
    <div className="flex items-center gap-4 rounded-2xl border border-border/50 bg-card p-5 transition-all hover:border-border hover:shadow-sm">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color}`}>
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-2xl font-bold tabular-nums text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
      {href && <ArrowRight className="ml-auto size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />}
    </div>
  )
  if (href)
    return (
      <Link href={href} className="group">
        {inner}
      </Link>
    )
  return inner
}

// ── Section header ────────────────────────────────────────────────────────────

function SectionHeader({ title, href, linkLabel }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
      {href && linkLabel && (
        <Link href={href} className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary">
          {linkLabel}
          <ArrowRight className="size-3" />
        </Link>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const [profile, myProjects, memberships, applications, contributions, subscriptions, notifications] =
    await Promise.all([
      getMyProfile(),
      getMyProjects(),
      getMyMemberships(),
      getMyApplications(),
      getMyContributions(),
      getMySubscriptions(),
      getMyNotifications(),
    ])

  const pendingApplications = applications.filter((a) => a.application.status === "pending")
  const pendingContributions = contributions.filter((c) => c.contribution.status === "submitted")
  const recentNotifications = notifications.slice(0, 8)
  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Panel de control</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestiona tus proyectos, postulaciones y contribuciones.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" render={<Link href="/projects" />} className="gap-1.5">
            <Telescope className="size-4" />
            Explorar
          </Button>
          <Button size="sm" render={<Link href="/dashboard/projects/new" />} className="gap-1.5 shadow-sm shadow-primary/30">
            <PlusCircle className="size-4" />
            Nuevo proyecto
          </Button>
        </div>
      </div>

      {/* ── Verification alert ───────────────────────────────────────── */}
      {profile?.verificationStatus === "pending" && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-500" />
          <p className="text-sm text-foreground">
            Tu correo institucional está <strong>pendiente de verificación</strong>. Un administrador revisará tu cuenta en breve.
            Mientras tanto, puedes explorar y postularte a proyectos.
          </p>
        </div>
      )}

      {/* ── Stats ────────────────────────────────────────────────────── */}
      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={FolderKanban}
          label="Proyectos liderados"
          value={myProjects.length}
          href="/dashboard/projects"
          color="bg-primary/10 text-primary"
        />
        <StatCard
          icon={Users}
          label="Membresías activas"
          value={memberships.length}
          color="bg-violet-500/10 text-violet-600 dark:text-violet-400"
        />
        <StatCard
          icon={ClipboardCheck}
          label="Postulaciones pendientes"
          value={pendingApplications.length}
          href="/dashboard/applications"
          color="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />
        <StatCard
          icon={FileCheck}
          label="Contribuciones en revisión"
          value={pendingContributions.length}
          href="/dashboard/contributions"
          color="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
      </div>

      {/* ── Main grid ────────────────────────────────────────────────── */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* ── Left column (2/3) ──────────────────────────────────────── */}
        <div className="flex flex-col gap-8 lg:col-span-2">
          {/* My projects */}
          <section>
            <SectionHeader title="Mis proyectos" href="/dashboard/projects" linkLabel="Ver todos" />
            {myProjects.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/60 py-10 text-center">
                <FolderKanban className="size-8 text-muted-foreground/40" />
                <div>
                  <p className="text-sm font-medium text-foreground">Sin proyectos todavía</p>
                  <p className="text-xs text-muted-foreground">Crea tu primer proyecto de investigación colaborativa.</p>
                </div>
                <Button size="sm" render={<Link href="/dashboard/projects/new" />} className="gap-1.5">
                  <PlusCircle className="size-4" />
                  Crear proyecto
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {myProjects.slice(0, 5).map((p) => (
                  <Link
                    key={p.id}
                    href={`/dashboard/projects/${p.id}`}
                    className="group flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-card p-4 transition-all hover:border-border hover:shadow-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground transition-colors group-hover:text-primary">
                        {p.title}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{p.summary}</p>
                    </div>
                    <StatusBadge status={p.status} />
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Active memberships */}
          <section>
            <SectionHeader title="Membresías activas" href="/projects" linkLabel="Explorar más" />
            {memberships.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/60 py-10 text-center">
                <Users className="size-8 text-muted-foreground/40" />
                <div>
                  <p className="text-sm font-medium text-foreground">No formas parte de ningún proyecto</p>
                  <p className="text-xs text-muted-foreground">Explora el catálogo y solicita colaborar.</p>
                </div>
                <Button variant="outline" size="sm" render={<Link href="/projects" />} className="gap-1.5">
                  <Telescope className="size-4" />
                  Explorar proyectos
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {memberships.slice(0, 5).map((m) => (
                  <Link
                    key={m.member.id}
                    href={`/projects/${m.project.slug}`}
                    className="group flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-card p-4 transition-all hover:border-border hover:shadow-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground transition-colors group-hover:text-primary">
                        {m.project.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {roleLabel[m.member.roleInProject] ?? m.member.roleInProject}
                      </p>
                    </div>
                    <ExternalLink className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Followed projects */}
          <section>
            <SectionHeader title="Proyectos seguidos" />
            {subscriptions.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/60 py-10 text-center">
                <BookOpen className="size-8 text-muted-foreground/40" />
                <div>
                  <p className="text-sm font-medium text-foreground">No sigues ningún proyecto</p>
                  <p className="text-xs text-muted-foreground">
                    En las páginas de detalle puedes seguir proyectos y recibir actualizaciones.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {subscriptions.map((s) => (
                  <Link
                    key={s.subscription.id}
                    href={`/projects/${s.project.slug}`}
                    className="group flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-card p-4 transition-all hover:border-border hover:shadow-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground transition-colors group-hover:text-primary">
                        {s.project.title}
                      </p>
                      <StatusBadge status={s.project.status} />
                    </div>
                    <ExternalLink className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* ── Right sidebar (1/3) ────────────────────────────────────── */}
        <div className="flex flex-col gap-8">
          {/* Applications status */}
          <section>
            <SectionHeader title="Mis postulaciones" href="/dashboard/applications" linkLabel="Ver todas" />
            {applications.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/60 py-8 text-center">
                <p className="text-sm text-muted-foreground">Sin postulaciones enviadas.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {applications.slice(0, 6).map(({ application, project }) => {
                  const cfg = applicationStatusConfig[application.status] ?? applicationStatusConfig["pending"]
                  const StatusIcon = cfg.icon
                  return (
                    <Link
                      key={application.id}
                      href={`/projects/${project.slug}`}
                      className="group flex items-start gap-3 rounded-xl border border-border/50 bg-card p-3.5 transition-all hover:border-border hover:shadow-sm"
                    >
                      <StatusIcon className={`mt-0.5 size-4 shrink-0 ${cfg.color}`} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground group-hover:text-primary">
                          {project.title}
                        </p>
                        <p className={`text-xs ${cfg.color}`}>{cfg.label}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </section>

          {/* Recent activity / notifications */}
          <section>
            <SectionHeader title={`Actividad reciente${unreadCount > 0 ? ` (${unreadCount} nueva${unreadCount > 1 ? "s" : ""})` : ""}`} />
            {recentNotifications.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/60 py-8 text-center">
                <Bell className="mx-auto mb-2 size-6 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Sin notificaciones todavía.</p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-border/40 overflow-hidden rounded-2xl border border-border/50 bg-card">
                {recentNotifications.map((n) => (
                  <Link
                    key={n.id}
                    href={n.link ?? "#"}
                    className="group flex items-start gap-3 p-3.5 transition-colors hover:bg-muted/30"
                  >
                    <div
                      className={`mt-1 h-2 w-2 shrink-0 rounded-full transition-colors ${
                        n.isRead ? "bg-transparent" : "bg-primary"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className={`truncate text-xs font-medium ${
                          n.isRead ? "text-muted-foreground" : "text-foreground"
                        }`}
                      >
                        {n.title}
                      </p>
                      <p className="line-clamp-2 text-xs text-muted-foreground">{n.message}</p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground/60">{formatRelative(n.createdAt)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
