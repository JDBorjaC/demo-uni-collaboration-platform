import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { getCategories, getPublishedProjects } from "@/lib/queries"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  FlaskConical,
  Globe,
  LayoutGrid,
  Lightbulb,
  Rocket,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react"

// ─── Static data ───────────────────────────────────────────────────────────────

const features = [
  {
    icon: Lightbulb,
    title: "Descubre proyectos",
    description:
      "Explora proyectos interdisciplinarios de múltiples universidades e instituciones, filtrados por área del conocimiento.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    icon: Users,
    title: "Colabora con expertos",
    description:
      "Únete a equipos de investigadores, estudiantes y líderes de proyectos con habilidades complementarias a las tuyas.",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  {
    icon: Rocket,
    title: "Lleva tus ideas lejos",
    description:
      "Publica tu proyecto, define objetivos claros y atrae colaboradores calificados para hacerlo realidad.",
    color: "text-sky-500",
    bg: "bg-sky-500/10",
  },
  {
    icon: ShieldCheck,
    title: "Revisión y moderación",
    description:
      "Cada proyecto pasa por un proceso de validación editorial que garantiza calidad y seriedad académica.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Zap,
    title: "Contribuciones verificadas",
    description:
      "Registra hitos, recursos y actualizaciones. Tus contribuciones quedan documentadas con aprobación formal.",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
  {
    icon: Globe,
    title: "Red universitaria abierta",
    description:
      "Conectamos universidades, empresas y organizaciones externas en una sola red de conocimiento compartido.",
    color: "text-teal-500",
    bg: "bg-teal-500/10",
  },
]

const categoryIcons: Record<string, React.ElementType> = {
  default: BrainCircuit,
  "inteligencia-artificial": BrainCircuit,
  biotecnologia: FlaskConical,
  sostenibilidad: Globe,
  fintech: LayoutGrid,
  educacion: BookOpen,
  robotica: Zap,
}

const stats = [
  { value: "12+", label: "Universidades" },
  { value: "140+", label: "Proyectos activos" },
  { value: "800+", label: "Colaboradores" },
  { value: "60+", label: "Contribuciones/mes" },
]

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

// ─── Page component ─────────────────────────────────────────────────────────────

export default async function HomePage() {
  const [categories, recentProjects] = await Promise.all([
    getCategories().catch(() => []),
    getPublishedProjects().catch(() => []),
  ])

  const featured = recentProjects.slice(0, 6)

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* ── Nav ──────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-md shadow-primary/30">
              <Sparkles className="size-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">Collab</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            <Link href="/projects" className="transition-colors hover:text-foreground">
              Proyectos
            </Link>
            <Link href="#features" className="transition-colors hover:text-foreground">
              Características
            </Link>
            <Link href="#categories" className="transition-colors hover:text-foreground">
              Áreas
            </Link>
          </nav>
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
        {/* ── Hero ─────────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden px-4 pb-24 pt-24 sm:px-6 sm:pt-32">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
            <div className="absolute bottom-0 right-0 h-[400px] w-[400px] translate-x-1/3 translate-y-1/3 rounded-full bg-accent/20 blur-[100px]" />
            <div className="absolute -left-20 top-1/2 h-[300px] w-[300px] -translate-y-1/2 rounded-full bg-violet-500/10 blur-[80px]" />
          </div>

          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="size-3.5" />
              Plataforma interdisciplinaria universitaria
            </div>
            <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl">
              Conecta. Colabora.{" "}
              <span className="bg-gradient-to-r from-primary via-violet-500 to-accent bg-clip-text text-transparent">
                Crea impacto.
              </span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Descubre proyectos de investigación universitaria, aplica para colaborar con equipos
              de todo el país y registra tus contribuciones con respaldo académico.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                render={<Link href="/sign-up" />}
                className="group gap-2 px-8 shadow-lg shadow-primary/30 transition-all hover:shadow-primary/40"
              >
                Comenzar ahora
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                render={<Link href="/projects" />}
                className="gap-2 border-border/60 px-8"
              >
                <LayoutGrid className="size-4" />
                Ver proyectos
              </Button>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mx-auto mt-20 max-w-3xl">
            <div className="grid grid-cols-2 gap-4 rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col items-center gap-1">
                  <span className="text-2xl font-bold text-foreground sm:text-3xl">{s.value}</span>
                  <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ─────────────────────────────────────────────────────────── */}
        <section id="features" className="px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-14 text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
                Por qué Collab
              </p>
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Todo lo que necesitas para colaborar
              </h2>
              <p className="mx-auto max-w-xl text-muted-foreground">
                Una plataforma pensada para el ecosistema académico, con herramientas que hacen
                la colaboración interdisciplinaria accesible y transparente.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => {
                const Icon = f.icon
                return (
                  <div
                    key={f.title}
                    className="group rounded-2xl border border-border/50 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-border hover:shadow-md"
                  >
                    <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${f.bg}`}>
                      <Icon className={`size-5 ${f.color}`} />
                    </div>
                    <h3 className="mb-2 font-semibold text-foreground">{f.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{f.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── Categories ───────────────────────────────────────────────────────── */}
        {categories.length > 0 && (
          <section id="categories" className="bg-muted/40 px-4 py-24 sm:px-6">
            <div className="mx-auto max-w-7xl">
              <div className="mb-14 text-center">
                <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
                  Áreas del conocimiento
                </p>
                <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                  Explora por disciplina
                </h2>
                <p className="mx-auto max-w-xl text-muted-foreground">
                  Desde inteligencia artificial hasta biotecnología. Encuentra la categoría que
                  mejor se adapta a tu perfil académico o profesional.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                {categories.map((cat) => {
                  const Icon = categoryIcons[cat.slug] ?? categoryIcons["default"]
                  return (
                    <Link
                      key={cat.id}
                      href={`/projects?categoryId=${cat.id}`}
                      className="group flex flex-col items-center gap-3 rounded-2xl border border-border/50 bg-card p-5 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                        <Icon className="size-5 text-primary" />
                      </div>
                      <span className="text-sm font-medium leading-tight text-foreground">
                        {cat.name}
                      </span>
                      {cat.description && (
                        <span className="line-clamp-2 text-xs text-muted-foreground">
                          {cat.description}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── Recent Projects ───────────────────────────────────────────────────── */}
        <section className="px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-14 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
              <div>
                <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
                  Proyectos recientes
                </p>
                <h2 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">
                  Descubre lo que se está construyendo
                </h2>
                <p className="text-muted-foreground">
                  Proyectos publicados recientemente buscando colaboradores como tú.
                </p>
              </div>
              <Button
                variant="outline"
                render={<Link href="/projects" />}
                className="shrink-0 gap-2 border-border/60"
              >
                Ver todos
                <ArrowRight className="size-4" />
              </Button>
            </div>

            {featured.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map(({ project, leaderName, categoryName }) => (
                  <Link
                    key={project.id}
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
                      <div className="absolute left-3 top-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            statusColor[project.status] ?? statusColor["draft"]
                          }`}
                        >
                          {statusLabel[project.status] ?? project.status}
                        </span>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="flex flex-1 flex-col gap-3 p-5">
                      {categoryName && (
                        <span className="text-xs font-medium uppercase tracking-wider text-primary">
                          {categoryName}
                        </span>
                      )}
                      <h3 className="line-clamp-2 text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                        {project.title}
                      </h3>
                      <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                        {project.summary}
                      </p>

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

                      <div className="mt-auto flex items-center justify-between border-t border-border/40 pt-3">
                        <span className="truncate text-xs text-muted-foreground">
                          Líder:{" "}
                          <span className="font-medium text-foreground">{leaderName}</span>
                        </span>
                        <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                          Ver más <ArrowRight className="size-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/60 py-20 text-center">
                <Sparkles className="size-10 text-muted-foreground/40" />
                <p className="text-muted-foreground">
                  Aún no hay proyectos publicados.{" "}
                  <Link
                    href="/sign-up"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    ¡Crea el primero!
                  </Link>
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ── CTA Banner ───────────────────────────────────────────────────────── */}
        <section className="px-4 pb-24 sm:px-6">
          <div className="mx-auto max-w-4xl">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-violet-600 to-accent p-12 text-center shadow-2xl shadow-primary/20">
              <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-black/10 blur-3xl" />
              </div>
              <div className="relative z-10">
                <h2 className="mb-4 text-3xl font-extrabold text-white sm:text-4xl">
                  ¿Listo para colaborar?
                </h2>
                <p className="mx-auto mb-8 max-w-lg text-primary-foreground/80">
                  Únete a cientos de estudiantes, investigadores y expertos que ya están
                  construyendo el futuro en Collab.
                </p>
                <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Button
                    size="lg"
                    render={<Link href="/sign-up" />}
                    className="gap-2 bg-white px-8 text-primary shadow-lg hover:bg-white/90"
                  >
                    Crear cuenta gratis
                    <ArrowRight className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    render={<Link href="/sign-in" />}
                    className="text-white/90 hover:bg-white/10 hover:text-white"
                  >
                    Ya tengo cuenta
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ────────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border/50 px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="size-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold tracking-tight">Collab</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Collab — Plataforma de Proyectos Colaborativos Universitarios
          </p>
          <div className="flex items-center gap-5 text-sm text-muted-foreground">
            <Link href="/projects" className="transition-colors hover:text-foreground">
              Proyectos
            </Link>
            <Link href="/sign-in" className="transition-colors hover:text-foreground">
              Iniciar sesión
            </Link>
            <Link href="/sign-up" className="transition-colors hover:text-foreground">
              Registrarse
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
