import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Suspense } from "react"
import {
  getCategories,
  getUniversityAffiliations,
  getPublishedProjectsPaginated,
} from "@/lib/queries"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Sparkles,
} from "lucide-react"
import { SearchFilters } from "./_components/search-filters"

export const metadata: Metadata = {
  title: "Explorar Proyectos — Collab",
  description:
    "Busca y filtra proyectos de investigación universitaria por categoría, universidad o habilidades requeridas. Aplica para colaborar.",
}

// ── Status helpers ─────────────────────────────────────────────────────────────

const statusLabel: Record<string, string> = {
  published: "Publicado",
  draft: "Borrador",
  pending_review: "En revisión",
  archived: "Archivado",
  rejected: "Rechazado",
}

const statusColor: Record<string, string> = {
  published: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  pending_review: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  draft: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400",
  archived: "bg-zinc-500/15 text-zinc-500",
  rejected: "bg-rose-500/15 text-rose-600",
}

// ── Pagination component ───────────────────────────────────────────────────────

function PaginationBar({
  page,
  totalPages,
  searchParams,
}: {
  page: number
  totalPages: number
  searchParams: Record<string, string>
}) {
  if (totalPages <= 1) return null

  function buildHref(p: number) {
    const params = new URLSearchParams(searchParams)
    params.set("page", String(p))
    return `/projects?${params.toString()}`
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  // Show at most 5 page numbers around current
  const start = Math.max(1, page - 2)
  const end = Math.min(totalPages, page + 2)
  const visible = pages.slice(start - 1, end)

  return (
    <nav
      aria-label="Paginación de proyectos"
      className="flex items-center justify-center gap-1 pt-10"
    >
      <Link
        href={buildHref(page - 1)}
        aria-disabled={page <= 1}
        className={`flex h-9 w-9 items-center justify-center rounded-md border border-border/60 text-sm transition-colors hover:bg-muted ${
          page <= 1 ? "pointer-events-none opacity-40" : ""
        }`}
      >
        <ChevronLeft className="size-4" />
      </Link>

      {start > 1 && (
        <>
          <Link
            href={buildHref(1)}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-border/60 text-sm transition-colors hover:bg-muted"
          >
            1
          </Link>
          {start > 2 && (
            <span className="flex h-9 w-9 items-center justify-center text-sm text-muted-foreground">
              …
            </span>
          )}
        </>
      )}

      {visible.map((p) => (
        <Link
          key={p}
          href={buildHref(p)}
          className={`flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors ${
            p === page
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border/60 hover:bg-muted"
          }`}
        >
          {p}
        </Link>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && (
            <span className="flex h-9 w-9 items-center justify-center text-sm text-muted-foreground">
              …
            </span>
          )}
          <Link
            href={buildHref(totalPages)}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-border/60 text-sm transition-colors hover:bg-muted"
          >
            {totalPages}
          </Link>
        </>
      )}

      <Link
        href={buildHref(page + 1)}
        aria-disabled={page >= totalPages}
        className={`flex h-9 w-9 items-center justify-center rounded-md border border-border/60 text-sm transition-colors hover:bg-muted ${
          page >= totalPages ? "pointer-events-none opacity-40" : ""
        }`}
      >
        <ChevronRight className="size-4" />
      </Link>
    </nav>
  )
}

// ── Project card ───────────────────────────────────────────────────────────────

type ProjectRow = {
  project: {
    id: string
    slug: string
    title: string
    summary: string
    status: string
    coverImageUrl: string | null
    collaborationNeeds: string[] | null
    maxMembers: number
  }
  leaderName: string
  categoryName: string | null
  affiliationName: string | null
}

function ProjectCard({ row }: { row: ProjectRow }) {
  const { project, leaderName, categoryName, affiliationName } = row
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex flex-col rounded-2xl border border-border/50 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-border hover:shadow-md"
    >
      {/* Cover */}
      <div className="relative h-44 overflow-hidden rounded-t-2xl bg-gradient-to-br from-primary/20 via-violet-500/10 to-accent/20">
        {project.coverImageUrl ? (
          <Image
            src={project.coverImageUrl}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Sparkles className="size-10 text-primary/30" />
          </div>
        )}
        {/* Status badge */}
        <div className="absolute left-3 top-3">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              statusColor[project.status] ?? statusColor["draft"]
            }`}
          >
            {statusLabel[project.status] ?? project.status}
          </span>
        </div>
        {/* Max members */}
        <div className="absolute bottom-3 right-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
            Hasta {project.maxMembers} miembros
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          {categoryName && (
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              {categoryName}
            </span>
          )}
          {affiliationName && (
            <span className="rounded-full border border-border/60 bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {affiliationName}
            </span>
          )}
        </div>

        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
          {project.title}
        </h3>
        <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {project.summary}
        </p>

        {/* Collaboration needs tags */}
        {project.collaborationNeeds && project.collaborationNeeds.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {project.collaborationNeeds.slice(0, 3).map((need) => (
              <span
                key={need}
                className="rounded-full border border-border/60 bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
              >
                {need}
              </span>
            ))}
            {project.collaborationNeeds.length > 3 && (
              <span className="rounded-full border border-border/60 bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                +{project.collaborationNeeds.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between border-t border-border/40 pt-3">
          <span className="truncate text-xs text-muted-foreground">
            Líder: <span className="font-medium text-foreground">{leaderName}</span>
          </span>
          <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
            Ver proyecto <ArrowRight className="size-3" />
          </span>
        </div>
      </div>
    </Link>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

type PageSearchParams = {
  query?: string
  categoryId?: string
  affiliationId?: string
  page?: string
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>
}) {
  const sp = await searchParams
  const query = sp.query ?? ""
  const categoryId = sp.categoryId ?? ""
  const affiliationId = sp.affiliationId ?? ""
  const page = parseInt(sp.page ?? "1", 10)

  const [categories, affiliations, result] = await Promise.all([
    getCategories().catch(() => []),
    getUniversityAffiliations().catch(() => []),
    getPublishedProjectsPaginated({
      query: query || undefined,
      categoryId: categoryId || undefined,
      affiliationId: affiliationId || undefined,
      page,
    }).catch(() => ({ data: [], total: 0, page: 1, limit: 9, totalPages: 0 })),
  ])

  const { data: projects, total, totalPages } = result

  const hasFilters = !!(query || categoryId || affiliationId)

  // Build serializable searchParams for pagination links
  const spRecord: Record<string, string> = {}
  if (query) spRecord.query = query
  if (categoryId) spRecord.categoryId = categoryId
  if (affiliationId) spRecord.affiliationId = affiliationId

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* ── Top Nav ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              render={<Link href="/" />}
              className="gap-1.5 text-muted-foreground"
            >
              <ArrowLeft className="size-4" />
              Inicio
            </Button>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm font-medium">Proyectos</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" render={<Link href="/sign-in" />}>
              Iniciar sesión
            </Button>
            <Button size="sm" render={<Link href="/sign-up" />} className="shadow-sm shadow-primary/30">
              Registrarse
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ── Page Header ────────────────────────────────────────────────────── */}
        <div className="border-b border-border/50 bg-card/40 px-4 py-8 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
              <LayoutGrid className="size-4" />
              <span>Catálogo de proyectos</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Explorar proyectos
            </h1>
            <p className="mt-1 text-muted-foreground">
              Encuentra proyectos universitarios abiertos a colaboradores.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          {/* ── Filters ──────────────────────────────────────────────────────── */}
          <div className="mb-8 rounded-2xl border border-border/50 bg-card p-4 shadow-sm sm:p-5">
            <Suspense>
              <SearchFilters
                categories={categories}
                affiliations={affiliations}
                currentQuery={query}
                currentCategoryId={categoryId}
                currentAffiliationId={affiliationId}
              />
            </Suspense>
          </div>

          {/* ── Results count ────────────────────────────────────────────────── */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {total === 0 ? (
                "Sin resultados"
              ) : (
                <>
                  <span className="font-medium text-foreground">{total}</span>{" "}
                  {total === 1 ? "proyecto" : "proyectos"} encontrados
                  {page > 1 && (
                    <span className="ml-1 text-muted-foreground">
                      · Página {page} de {totalPages}
                    </span>
                  )}
                </>
              )}
            </p>
            {hasFilters && (
              <Button
                variant="link"
                size="sm"
                render={<Link href="/projects" />}
                className="text-xs text-muted-foreground"
              >
                Ver todos
              </Button>
            )}
          </div>

          {/* ── Project grid ─────────────────────────────────────────────────── */}
          {projects.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((row) => (
                <ProjectCard key={row.project.id} row={row as ProjectRow} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/60 py-24 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <Sparkles className="size-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  {hasFilters ? "Sin resultados para esta búsqueda" : "Todavía no hay proyectos"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {hasFilters
                    ? "Intenta con otros términos o limpia los filtros."
                    : "Sé el primero en publicar un proyecto de investigación."}
                </p>
              </div>
              {hasFilters ? (
                <Button
                  variant="outline"
                  size="sm"
                  render={<Link href="/projects" />}
                >
                  Limpiar filtros
                </Button>
              ) : (
                <Button
                  size="sm"
                  render={<Link href="/sign-up" />}
                  className="shadow-sm shadow-primary/30"
                >
                  Crear proyecto
                </Button>
              )}
            </div>
          )}

          {/* ── Pagination ───────────────────────────────────────────────────── */}
          <PaginationBar page={page} totalPages={totalPages} searchParams={spRecord} />
        </div>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border/50 px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="size-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold tracking-tight">Collab</span>
          </Link>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Collab
          </p>
        </div>
      </footer>
    </div>
  )
}
