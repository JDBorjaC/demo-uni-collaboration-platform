import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import {
  getProjectBySlug,
  getProjectMembers,
  getApprovedContributions,
  getUserMembership,
  getUserProjectSubscription,
  getUserPendingApplication,
} from "@/lib/queries"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { ApplyButton } from "./_components/apply-button"
import { SubscribeButton } from "./_components/subscribe-button"
import {
  ArrowLeft,
  BookOpen,
  Building2,
  CalendarDays,
  FileText,
  Lightbulb,
  Milestone,
  Sparkles,
  Target,
  Users,
  Wrench,
  Zap,
} from "lucide-react"

// ── helpers ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const row = await getProjectBySlug(slug).catch(() => null)
  if (!row) return { title: "Proyecto no encontrado — Collab" }
  return {
    title: `${row.project.title} — Collab`,
    description: row.project.summary,
  }
}

const contributionTypeIcon: Record<string, React.ElementType> = {
  update: Zap,
  milestone: Milestone,
  resource: BookOpen,
  report: FileText,
}

const contributionTypeLabel: Record<string, string> = {
  update: "Actualización",
  milestone: "Hito",
  resource: "Recurso",
  report: "Reporte",
}

const contributionTypeColor: Record<string, string> = {
  update: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  milestone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  resource: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  report: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
}

const roleLabel: Record<string, string> = {
  leader: "Líder",
  manager: "Manager",
  contributor: "Colaborador",
}

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date))
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const row = await getProjectBySlug(slug).catch(() => null)
  if (!row) notFound()

  const { project, leaderName, leaderEmail, categoryName } = row

  // Auth: get current session (optional — no throw if unauthenticated)
  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null)
  const currentUserId = session?.user?.id ?? null

  // Parallel fetch of page data
  const [members, contributions] = await Promise.all([
    getProjectMembers(project.id).catch(() => []),
    getApprovedContributions(project.id).catch(() => []),
  ])

  // User-specific state (only if logged in)
  const [membership, subscription, pendingApplication] = currentUserId
    ? await Promise.all([
        getUserMembership(project.id, currentUserId).catch(() => null),
        getUserProjectSubscription(project.id, currentUserId).catch(() => null),
        getUserPendingApplication(project.id, currentUserId).catch(() => null),
      ])
    : [null, null, null]

  const isLeader = currentUserId === project.leaderId
  const isActiveMember = !!membership && (membership as { status: string }).status === "active"
  const isSubscribed = !!subscription
  const hasPendingApp = !!pendingApplication

  // Determine apply button state
  type ApplyKind = "guest" | "member" | "pending" | "can_apply"
  let applyKind: ApplyKind = "can_apply"
  if (!currentUserId) applyKind = "guest"
  else if (isLeader || isActiveMember) applyKind = "member"
  else if (hasPendingApp) applyKind = "pending"

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" render={<Link href="/projects" />} className="gap-1.5 text-muted-foreground">
              <ArrowLeft className="size-4" />
              Proyectos
            </Button>
            <span className="hidden text-muted-foreground sm:inline">/</span>
            <span className="hidden max-w-xs truncate text-sm font-medium sm:inline">{project.title}</span>
          </div>
          <div className="flex items-center gap-3">
            {currentUserId ? (
              <Button variant="ghost" size="sm" render={<Link href="/dashboard" />}>
                Dashboard
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" render={<Link href="/sign-in" />}>
                  Iniciar sesión
                </Button>
                <Button size="sm" render={<Link href="/sign-up" />} className="shadow-sm shadow-primary/30">
                  Registrarse
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ── Hero header ──────────────────────────────────────────────── */}
        <div className="relative overflow-hidden border-b border-border/50">
          {/* Cover image or gradient */}
          <div className="absolute inset-0 -z-10">
            {project.coverImageUrl ? (
              <>
                <Image
                  src={project.coverImageUrl}
                  alt={project.title}
                  fill
                  className="object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
              </>
            ) : (
              <div className="h-full bg-gradient-to-br from-primary/10 via-violet-500/5 to-accent/10" />
            )}
          </div>

          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
            {/* Breadcrumb tags */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <StatusBadge status={project.status} />
              {categoryName && (
                <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-primary">
                  {categoryName}
                </span>
              )}
            </div>

            <h1 className="mb-3 text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl md:text-4xl">
              {project.title}
            </h1>
            <p className="mb-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              {project.summary}
            </p>

            {/* Meta info */}
            <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Users className="size-4" />
                Liderado por{" "}
                <span className="font-medium text-foreground">{leaderName}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-4" />
                {formatDate(project.createdAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="size-4" />
                {members.length}/{project.maxMembers} miembros
              </span>
            </div>

            {/* CTA buttons */}
            {project.status === "published" && (
              <div className="flex flex-wrap items-center gap-3">
                <ApplyButton
                  projectId={project.id}
                  projectTitle={project.title}
                  state={{ kind: applyKind }}
                />
                <SubscribeButton
                  projectId={project.id}
                  isLoggedIn={!!currentUserId}
                  isSubscribed={isSubscribed}
                />
              </div>
            )}
          </div>
        </div>

        {/* ── Content grid ─────────────────────────────────────────────── */}
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* ── Main column ──────────────────────────────────────────── */}
            <div className="flex flex-col gap-8 lg:col-span-2">
              {/* Description */}
              {project.description && (
                <section>
                  <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                    <Lightbulb className="size-5 text-primary" />
                    Descripción del proyecto
                  </h2>
                  <div className="rounded-2xl border border-border/50 bg-card p-6 text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                    {project.description}
                  </div>
                </section>
              )}

              {/* Objectives */}
              {project.objectives && (
                <section>
                  <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                    <Target className="size-5 text-primary" />
                    Objetivos
                  </h2>
                  <div className="rounded-2xl border border-border/50 bg-card p-6 text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                    {project.objectives}
                  </div>
                </section>
              )}

              {/* Collaboration needs */}
              {project.collaborationNeeds && project.collaborationNeeds.length > 0 && (
                <section>
                  <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                    <Wrench className="size-5 text-primary" />
                    Necesidades de colaboración
                  </h2>
                  <div className="rounded-2xl border border-border/50 bg-card p-6">
                    <div className="flex flex-wrap gap-2">
                      {project.collaborationNeeds.map((need) => (
                        <span
                          key={need}
                          className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                        >
                          {need}
                        </span>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* Contributions wall */}
              <section>
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                  <Milestone className="size-5 text-primary" />
                  Contribuciones y avances
                  {contributions.length > 0 && (
                    <span className="ml-auto rounded-full bg-muted px-2.5 py-0.5 text-xs font-normal text-muted-foreground">
                      {contributions.length}
                    </span>
                  )}
                </h2>

                {contributions.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {contributions.map(({ contribution, memberName, roleInProject }) => {
                      const Icon = contributionTypeIcon[contribution.type] ?? Zap
                      const colorClass = contributionTypeColor[contribution.type] ?? contributionTypeColor["update"]
                      return (
                        <div
                          key={contribution.id}
                          className="rounded-2xl border border-border/50 bg-card p-5"
                        >
                          <div className="mb-3 flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${colorClass}`}>
                                <Icon className="size-4" />
                              </div>
                              <div>
                                <span className={`text-xs font-semibold uppercase tracking-wider ${colorClass.split(" ")[1]}`}>
                                  {contributionTypeLabel[contribution.type] ?? contribution.type}
                                </span>
                                <h3 className="text-sm font-semibold text-foreground">
                                  {contribution.title}
                                </h3>
                              </div>
                            </div>
                            <span className="shrink-0 text-xs text-muted-foreground">
                              {formatDate(contribution.createdAt)}
                            </span>
                          </div>
                          <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
                            {contribution.description}
                          </p>
                          {contribution.contentUrl && (
                            <a
                              href={contribution.contentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent/10"
                            >
                              <BookOpen className="size-3.5" />
                              Ver recurso
                            </a>
                          )}
                          <div className="mt-3 border-t border-border/40 pt-3">
                            <span className="text-xs text-muted-foreground">
                              Por{" "}
                              <span className="font-medium text-foreground">{memberName}</span>{" "}
                              ·{" "}
                              <span>{roleLabel[roleInProject] ?? roleInProject}</span>
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/60 py-12 text-center">
                    <Sparkles className="size-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">
                      Aún no hay contribuciones aprobadas en este proyecto.
                    </p>
                  </div>
                )}
              </section>
            </div>

            {/* ── Sidebar ──────────────────────────────────────────────── */}
            <div className="flex flex-col gap-6">
              {/* Leader card */}
              <div className="rounded-2xl border border-border/50 bg-card p-5">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Líder del proyecto
                </h3>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {leaderName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{leaderName}</p>
                    <p className="text-xs text-muted-foreground">{leaderEmail}</p>
                  </div>
                </div>
              </div>

              {/* Members list */}
              <div className="rounded-2xl border border-border/50 bg-card p-5">
                <h3 className="mb-4 flex items-center justify-between text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  <span>Equipo</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-normal normal-case">
                    {members.length}/{project.maxMembers}
                  </span>
                </h3>
                {members.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {members.map(({ member, name, email }) => (
                      <div key={member.id} className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                          {name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{name}</p>
                          <p className="truncate text-xs text-muted-foreground">{roleLabel[member.roleInProject] ?? member.roleInProject}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Sin miembros aún.</p>
                )}
              </div>

              {/* Project details card */}
              <div className="rounded-2xl border border-border/50 bg-card p-5">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Detalles
                </h3>
                <dl className="flex flex-col gap-3 text-sm">
                  <div className="flex items-start gap-2">
                    <dt className="text-muted-foreground">Estado</dt>
                    <dd className="ml-auto"><StatusBadge status={project.status} /></dd>
                  </div>
                  {categoryName && (
                    <div className="flex items-start gap-2">
                      <dt className="text-muted-foreground">Categoría</dt>
                      <dd className="ml-auto text-right font-medium text-foreground">{categoryName}</dd>
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <dt className="text-muted-foreground">Visibilidad</dt>
                    <dd className="ml-auto font-medium text-foreground">
                      {project.visibility === "public" ? "Público" : "Solo universidad"}
                    </dd>
                  </div>
                  <div className="flex items-start gap-2">
                    <dt className="text-muted-foreground">Creado</dt>
                    <dd className="ml-auto text-right text-muted-foreground">{formatDate(project.createdAt)}</dd>
                  </div>
                </dl>
              </div>

              {/* CTA repeat on sidebar for mobile convenience */}
              {project.status === "published" && (
                <div className="flex flex-col gap-2 lg:hidden">
                  <ApplyButton
                    projectId={project.id}
                    projectTitle={project.title}
                    state={{ kind: applyKind }}
                  />
                  <SubscribeButton
                    projectId={project.id}
                    isLoggedIn={!!currentUserId}
                    isSubscribed={isSubscribed}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-border/50 px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="size-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold tracking-tight">Collab</span>
          </Link>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/projects" className="hover:text-foreground">Proyectos</Link>
            <Link href="/sign-in" className="hover:text-foreground">Iniciar sesión</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
