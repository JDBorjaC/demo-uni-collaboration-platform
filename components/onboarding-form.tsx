"use client"

import { useState, useTransition, useRef } from "react"
import { useRouter } from "next/navigation"
import { completeOnboarding } from "@/app/actions/onboarding"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { CheckCircle, X, Plus, Sparkles, Building2, Mail, User, Tag, BookOpen, AlertCircle } from "lucide-react"

// ── Constants ─────────────────────────────────────────────────────────────────

const roles = [
  { value: "student", label: "Estudiante", description: "Busco proyectos en los que colaborar" },
  { value: "project_leader", label: "Líder de proyecto", description: "Propongo y dirijo proyectos" },
  { value: "collaborator", label: "Colaborador", description: "Participo activamente en proyectos" },
  { value: "external_expert", label: "Experto externo", description: "Asesoro desde fuera de la institución" },
  { value: "moderator", label: "Moderador", description: "Reviso y valido proyectos en la plataforma" },
] as const

type RoleValue = (typeof roles)[number]["value"]

const SUGGESTED_SKILLS = [
  "Python", "Machine Learning", "Estadística", "Biotecnología",
  "React", "Node.js", "PostgreSQL", "Diseño UX", "Robótica",
  "Finanzas", "Educación", "Sostenibilidad", "Análisis de datos",
  "Visión artificial", "NLP", "IoT",
]

type Affiliation = { id: string; name: string; domain: string }

interface OnboardingFormProps {
  affiliations: Affiliation[]
  userName: string
}

// ── Component ──────────────────────────────────────────────────────────────────

export function OnboardingForm({ affiliations, userName }: OnboardingFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Fields
  const [role, setRole] = useState<RoleValue>("student")
  const [affiliationId, setAffiliationId] = useState("")
  const [email, setEmail] = useState("")
  const [bio, setBio] = useState("")
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState("")
  const skillInputRef = useRef<HTMLInputElement>(null)

  // Live domain validation
  const selectedAffiliation = affiliations.find((a) => a.id === affiliationId)
  const emailDomain = email.includes("@") ? email.split("@")[1]?.toLowerCase() : ""
  const domainMatch =
    selectedAffiliation && emailDomain
      ? emailDomain === selectedAffiliation.domain.toLowerCase()
      : null

  // Skills helpers
  function addSkill(skill: string) {
    const trimmed = skill.trim()
    if (trimmed && !skills.includes(trimmed) && skills.length < 15) {
      setSkills((prev) => [...prev, trimmed])
    }
    setSkillInput("")
  }

  function removeSkill(skill: string) {
    setSkills((prev) => prev.filter((s) => s !== skill))
  }

  function handleSkillKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addSkill(skillInput)
    } else if (e.key === "Backspace" && skillInput === "" && skills.length > 0) {
      setSkills((prev) => prev.slice(0, -1))
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!affiliationId) return

    startTransition(async () => {
      const result = await completeOnboarding({
        role,
        bio: bio.trim() || undefined,
        skills,
        universityAffiliationId: affiliationId,
        institutionalEmail: email,
      })

      if (!result.success) {
        toast.error(result.error)
        return
      }

      toast.success("¡Perfil configurado! Bienvenido/a a Collab.")
      router.push("/dashboard")
      router.refresh()
    })
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/30">
              <Sparkles className="size-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">Collab</span>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card shadow-sm">
          {/* Header */}
          <div className="border-b border-border/40 px-6 py-6">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              ¡Hola, {userName.split(" ")[0]}! Configura tu perfil
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Completa estos datos para verificar tu afiliación institucional y personalizar tu experiencia.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6">
            {/* ── Rol ─────────────────────────────────────────────────── */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="role" className="flex items-center gap-1.5 text-sm font-medium">
                <User className="size-3.5 text-muted-foreground" />
                Rol en la plataforma
              </Label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                      role === r.value
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border/60 bg-background hover:border-border hover:bg-muted/30"
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                        role === r.value ? "border-primary bg-primary" : "border-border"
                      }`}
                    >
                      {role === r.value && <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{r.label}</p>
                      <p className="text-xs text-muted-foreground">{r.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Institución ─────────────────────────────────────────── */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="affiliation" className="flex items-center gap-1.5 text-sm font-medium">
                <Building2 className="size-3.5 text-muted-foreground" />
                Institución
              </Label>
              <Select value={affiliationId} onValueChange={(val) => setAffiliationId(val ?? "")}>
                <SelectTrigger id="affiliation">
                  <SelectValue placeholder="Selecciona tu universidad o empresa" />
                </SelectTrigger>
                <SelectContent>
                  {affiliations.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedAffiliation && (
                <p className="text-xs text-muted-foreground">
                  Dominio institucional: <span className="font-medium text-foreground">@{selectedAffiliation.domain}</span>
                </p>
              )}
            </div>

            {/* ── Email institucional ──────────────────────────────────── */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="flex items-center gap-1.5 text-sm font-medium">
                <Mail className="size-3.5 text-muted-foreground" />
                Correo institucional
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={selectedAffiliation ? `tu@${selectedAffiliation.domain}` : "tu@universidad.edu"}
                  className={`pr-9 transition-colors ${
                    domainMatch === true
                      ? "border-emerald-500 focus-visible:ring-emerald-500/30"
                      : domainMatch === false
                      ? "border-amber-500 focus-visible:ring-amber-500/30"
                      : ""
                  }`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {domainMatch === true && <CheckCircle className="size-4 text-emerald-500" />}
                  {domainMatch === false && <AlertCircle className="size-4 text-amber-500" />}
                </div>
              </div>
              {domainMatch === true && (
                <p className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="size-3" />
                  Dominio verificado — tu cuenta quedará como <strong>Verificada</strong>
                </p>
              )}
              {domainMatch === false && (
                <p className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                  <AlertCircle className="size-3" />
                  El dominio no coincide — tu cuenta quedará como <strong>Pendiente de verificación</strong>
                </p>
              )}
              {domainMatch === null && (
                <p className="text-xs text-muted-foreground">
                  Verificamos que el dominio coincida con tu institución para validar tu cuenta automáticamente.
                </p>
              )}
            </div>

            {/* ── Habilidades ─────────────────────────────────────────── */}
            <div className="flex flex-col gap-2">
              <Label className="flex items-center gap-1.5 text-sm font-medium">
                <Tag className="size-3.5 text-muted-foreground" />
                Habilidades y áreas de interés
                <span className="ml-auto font-normal text-xs text-muted-foreground">
                  {skills.length}/15
                </span>
              </Label>

              {/* Tags display + input */}
              <div
                className="flex min-h-[44px] flex-wrap gap-1.5 rounded-md border border-input bg-background px-3 py-2 cursor-text"
                onClick={() => skillInputRef.current?.focus()}
              >
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeSkill(skill) }}
                      className="rounded-full p-0.5 hover:bg-primary/20"
                    >
                      <X className="size-2.5" />
                    </button>
                  </span>
                ))}
                <input
                  ref={skillInputRef}
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  placeholder={skills.length === 0 ? "Escribe y presiona Enter para agregar..." : ""}
                  className="min-w-[140px] flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  disabled={skills.length >= 15}
                />
              </div>

              {/* Suggested skills */}
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_SKILLS.filter((s) => !skills.includes(s)).slice(0, 8).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => addSkill(s)}
                    disabled={skills.length >= 15}
                    className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Plus className="size-2.5" />
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Bio ─────────────────────────────────────────────────── */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="bio" className="flex items-center justify-between text-sm font-medium">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="size-3.5 text-muted-foreground" />
                  Breve bio (opcional)
                </span>
                <span className="font-normal text-xs text-muted-foreground">{bio.length}/500</span>
              </Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 500))}
                placeholder="Cuéntanos sobre tu área de investigación, departamento o intereses académicos..."
                rows={3}
                className="resize-none"
              />
            </div>

            {/* ── Submit ──────────────────────────────────────────────── */}
            <Button
              type="submit"
              disabled={isPending || !affiliationId || !email}
              className="w-full gap-2 shadow-sm shadow-primary/30"
            >
              {isPending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Configurando perfil...
                </>
              ) : (
                <>
                  <CheckCircle className="size-4" />
                  Completar configuración
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </main>
  )
}

