"use client"

import { useState, useTransition, useMemo } from "react"
import { setUserRole, setUserVerification } from "@/app/actions/admin"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  ShieldCheck,
  ShieldX,
  Clock,
  ChevronDown,
  Loader2,
  UserCog,
  Building2,
  Mail,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from "lucide-react"
import { toast } from "sonner"

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = "student" | "project_leader" | "collaborator" | "moderator" | "admin" | "external_expert"
type VerificationStatus = "pending" | "verified" | "rejected"

type UserRow = {
  user: {
    id: string
    name: string
    email: string
    image: string | null
    createdAt: Date | string
    emailVerified: boolean
  }
  profile: {
    id: string
    role: Role
    bio: string | null
    institutionalEmail: string | null
    verificationStatus: VerificationStatus
    skills: string[] | null
    universityAffiliationId: string | null
    createdAt: Date | string
  } | null
  affiliationName: string | null
}

// ─── Constants ────────────────────────────────────────────────────────────────

const roleOptions: { value: Role; label: string }[] = [
  { value: "student", label: "Estudiante" },
  { value: "project_leader", label: "Líder de Proyecto" },
  { value: "collaborator", label: "Colaborador" },
  { value: "external_expert", label: "Experto Externo" },
  { value: "moderator", label: "Moderador" },
  { value: "admin", label: "Administrador" },
]

const roleBadge: Record<Role, string> = {
  student: "bg-neutral-700/50 text-neutral-300 border-neutral-600/40",
  project_leader: "bg-sky-500/15 text-sky-300 border-sky-500/25",
  collaborator: "bg-teal-500/15 text-teal-300 border-teal-500/25",
  external_expert: "bg-orange-500/15 text-orange-300 border-orange-500/25",
  moderator: "bg-blue-500/15 text-blue-300 border-blue-500/25",
  admin: "bg-violet-500/15 text-violet-300 border-violet-500/25",
}

const roleLabel: Record<Role, string> = {
  student: "Estudiante",
  project_leader: "Líder",
  collaborator: "Colaborador",
  external_expert: "Experto Ext.",
  moderator: "Moderador",
  admin: "Admin",
}

const verificationConfig: Record<VerificationStatus, { icon: React.ElementType; label: string; cls: string }> = {
  verified: { icon: ShieldCheck, label: "Verificado", cls: "text-emerald-400 border-emerald-500/25 bg-emerald-500/10" },
  pending: { icon: Clock, label: "Pendiente", cls: "text-amber-400 border-amber-500/25 bg-amber-500/10" },
  rejected: { icon: ShieldX, label: "Rechazado", cls: "text-red-400 border-red-500/25 bg-red-500/10" },
}

function formatDate(d: Date | string | null) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "numeric" })
}

// ─── User Row component ───────────────────────────────────────────────────────

function UserRow({ row }: { row: UserRow }) {
  const [isPending, startTransition] = useTransition()
  const [currentRole, setCurrentRole] = useState<Role>(row.profile?.role ?? "student")
  const [currentVerification, setCurrentVerification] = useState<VerificationStatus>(
    row.profile?.verificationStatus ?? "pending",
  )
  const [roleMenuOpen, setRoleMenuOpen] = useState(false)

  const profileId = row.profile?.id

  function handleRoleChange(role: Role) {
    if (!profileId) return
    setRoleMenuOpen(false)
    startTransition(async () => {
      const res = await setUserRole(profileId, role)
      if (res.success) {
        setCurrentRole(role)
        toast.success(`Rol actualizado a "${roleLabel[role]}"`)
      } else {
        toast.error(res.error)
      }
    })
  }

  function handleVerification(status: VerificationStatus) {
    if (!profileId) return
    startTransition(async () => {
      const res = await setUserVerification(profileId, status)
      if (res.success) {
        setCurrentVerification(status)
        toast.success(
          status === "verified"
            ? "Verificación institucional aprobada"
            : status === "rejected"
              ? "Verificación institucional rechazada"
              : "Verificación restablecida a pendiente",
        )
      } else {
        toast.error(res.error)
      }
    })
  }

  const vCfg = verificationConfig[currentVerification]
  const VIcon = vCfg.icon
  const initials = row.user.name.slice(0, 2).toUpperCase()

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-neutral-900/60 p-4 transition-all hover:border-white/12 sm:flex-row sm:items-center sm:gap-4">
      {/* Avatar */}
      <Avatar className="size-10 shrink-0 ring-2 ring-white/10">
        <AvatarImage src={row.user.image ?? undefined} alt={row.user.name} />
        <AvatarFallback className="bg-neutral-800 text-sm font-medium text-neutral-300">{initials}</AvatarFallback>
      </Avatar>

      {/* Identity */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-white">{row.user.name}</p>
          {!row.profile && (
            <Badge className="border border-orange-500/25 bg-orange-500/10 text-[10px] text-orange-300">
              Sin perfil
            </Badge>
          )}
        </div>
        <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-neutral-500">
          <span className="flex items-center gap-1">
            <Mail className="size-3" />
            {row.user.email}
          </span>
          {row.profile?.institutionalEmail && (
            <span className="flex items-center gap-1">
              <Building2 className="size-3" />
              {row.profile.institutionalEmail}
            </span>
          )}
          {row.affiliationName && (
            <span className="text-neutral-600">· {row.affiliationName}</span>
          )}
          <span className="text-neutral-600">Desde {formatDate(row.user.createdAt)}</span>
        </div>
        {row.profile?.skills && row.profile.skills.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {row.profile.skills.slice(0, 4).map((s) => (
              <span key={s} className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-neutral-500">
                {s}
              </span>
            ))}
            {row.profile.skills.length > 4 && (
              <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-neutral-600">
                +{row.profile.skills.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {/* Verification badge + actions */}
        <div className="flex items-center gap-1.5">
          <Badge className={`flex items-center gap-1 border text-[10px] font-semibold ${vCfg.cls}`}>
            <VIcon className="size-3" />
            {vCfg.label}
          </Badge>
          {profileId && (
            <div className="flex gap-1">
              {currentVerification !== "verified" && (
                <button
                  onClick={() => handleVerification("verified")}
                  disabled={isPending}
                  title="Aprobar verificación"
                  className="rounded-md p-1 text-neutral-600 transition-colors hover:bg-emerald-500/10 hover:text-emerald-400 disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
                </button>
              )}
              {currentVerification !== "rejected" && (
                <button
                  onClick={() => handleVerification("rejected")}
                  disabled={isPending}
                  title="Rechazar verificación"
                  className="rounded-md p-1 text-neutral-600 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                >
                  <XCircle className="size-3.5" />
                </button>
              )}
              {currentVerification !== "pending" && (
                <button
                  onClick={() => handleVerification("pending")}
                  disabled={isPending}
                  title="Restablecer a pendiente"
                  className="rounded-md p-1 text-neutral-600 transition-colors hover:bg-amber-500/10 hover:text-amber-400 disabled:opacity-50"
                >
                  <RotateCcw className="size-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Role selector */}
        {profileId ? (
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen((v) => !v)}
              disabled={isPending}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-50 ${roleBadge[currentRole]}`}
            >
              {isPending ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <UserCog className="size-3" />
              )}
              {roleLabel[currentRole]}
              <ChevronDown className="size-3" />
            </button>
            {roleMenuOpen && (
              <div className="absolute right-0 top-full z-20 mt-1 min-w-[160px] rounded-xl border border-white/10 bg-neutral-900 p-1 shadow-2xl">
                {roleOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleRoleChange(opt.value)}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
                      currentRole === opt.value
                        ? "bg-white/10 text-white"
                        : "text-neutral-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {currentRole === opt.value && <CheckCircle2 className="size-3 text-violet-400" />}
                    <span className={currentRole === opt.value ? "ml-0" : "ml-5"}>{opt.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <span className="text-xs text-neutral-600">Sin perfil</span>
        )}
      </div>
    </div>
  )
}

// ─── Main table component ─────────────────────────────────────────────────────

export function AdminUsersTable({ users }: { users: UserRow[] }) {
  const [query, setQuery] = useState("")
  const [filterVerification, setFilterVerification] = useState<VerificationStatus | "all">("all")
  const [filterRole, setFilterRole] = useState<Role | "all">("all")

  const filtered = useMemo(() => {
    let list = users
    const q = query.toLowerCase().trim()
    if (q) {
      list = list.filter(
        (r) =>
          r.user.name.toLowerCase().includes(q) ||
          r.user.email.toLowerCase().includes(q) ||
          (r.profile?.institutionalEmail ?? "").toLowerCase().includes(q) ||
          (r.affiliationName ?? "").toLowerCase().includes(q),
      )
    }
    if (filterVerification !== "all") {
      list = list.filter((r) => r.profile?.verificationStatus === filterVerification)
    }
    if (filterRole !== "all") {
      list = list.filter((r) => r.profile?.role === filterRole)
    }
    return list
  }, [users, query, filterVerification, filterRole])

  const pendingCount = users.filter((r) => r.profile?.verificationStatus === "pending").length

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, email o institución…"
            className="h-10 w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-4 text-sm text-neutral-200 placeholder-neutral-600 outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30"
          />
        </div>

        {/* Verification filter */}
        <select
          value={filterVerification}
          onChange={(e) => setFilterVerification(e.target.value as VerificationStatus | "all")}
          className="h-10 rounded-xl border border-white/10 bg-neutral-900 px-3 text-sm text-neutral-300 outline-none focus:border-violet-500/50"
        >
          <option value="all">Todas las verificaciones</option>
          <option value="pending">Pendientes {pendingCount > 0 ? `(${pendingCount})` : ""}</option>
          <option value="verified">Verificados</option>
          <option value="rejected">Rechazados</option>
        </select>

        {/* Role filter */}
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value as Role | "all")}
          className="h-10 rounded-xl border border-white/10 bg-neutral-900 px-3 text-sm text-neutral-300 outline-none focus:border-violet-500/50"
        >
          <option value="all">Todos los roles</option>
          {roleOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Pending verification alert */}
      {pendingCount > 0 && filterVerification === "all" && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/8 px-4 py-3">
          <Clock className="size-4 shrink-0 text-amber-400" />
          <p className="text-sm text-amber-300">
            <span className="font-semibold">{pendingCount} usuario{pendingCount !== 1 ? "s" : ""}</span> con verificación institucional pendiente.
          </p>
          <button
            onClick={() => setFilterVerification("pending")}
            className="ml-auto shrink-0 text-xs font-medium text-amber-400 hover:underline"
          >
            Filtrar →
          </button>
        </div>
      )}

      {/* Results count */}
      <p className="text-xs text-neutral-600">
        Mostrando {filtered.length} de {users.length} usuarios
      </p>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/8 bg-neutral-900/40 py-16 text-center">
          <Search className="mb-3 size-8 text-neutral-700" />
          <p className="text-sm font-medium text-neutral-400">No se encontraron usuarios</p>
          <p className="mt-1 text-xs text-neutral-600">Intenta con otros filtros de búsqueda</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((row) => (
            <UserRow key={row.user.id} row={row} />
          ))}
        </div>
      )}
    </div>
  )
}
