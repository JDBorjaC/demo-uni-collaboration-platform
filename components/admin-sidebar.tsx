"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  ShieldCheck,
  Users,
  ScrollText,
  LogOut,
  ChevronRight,
} from "lucide-react"

type Profile = {
  role: "student" | "project_leader" | "collaborator" | "moderator" | "admin" | "external_expert"
  verificationStatus: "pending" | "verified" | "rejected"
}

const navItems = [
  {
    href: "/admin",
    label: "Overview",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/admin/moderation",
    label: "Moderación",
    icon: ShieldCheck,
    exact: false,
  },
  {
    href: "/admin/users",
    label: "Usuarios",
    icon: Users,
    exact: false,
  },
  {
    href: "/admin/audit-logs",
    label: "Audit Logs",
    icon: ScrollText,
    exact: false,
  },
]

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  moderator: "Moderador",
}

const roleBadgeClasses: Record<string, string> = {
  admin: "bg-violet-500/15 text-violet-400 border-violet-500/25",
  moderator: "bg-sky-500/15 text-sky-400 border-sky-500/25",
}

export function AdminSidebar({
  user,
  profile,
}: {
  user: { name: string; email: string; image?: string | null }
  profile: Profile
}) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    await authClient.signOut()
    router.push("/")
    router.refresh()
  }

  function isActive(item: (typeof navItems)[0]) {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-white/8 bg-neutral-950 lg:sticky lg:top-0">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-white/8 px-5">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="Collab logo" width={28} height={28} className="rounded-md" />
          <span className="font-semibold tracking-tight text-white">Collab</span>
        </Link>
        <span className="ml-auto text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
          Admin
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        <p className="mb-2 px-3 pt-1 text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
          Panel de Control
        </p>
        {navItems.map((item) => {
          const active = isActive(item)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-white/10 text-white"
                  : "text-neutral-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon
                className={`size-4 transition-colors ${active ? "text-violet-400" : "text-neutral-500 group-hover:text-neutral-300"}`}
              />
              <span>{item.label}</span>
              {active && <ChevronRight className="ml-auto size-3.5 text-violet-400" />}
            </Link>
          )
        })}

        <div className="my-3 border-t border-white/8" />

        <p className="mb-2 px-3 pt-1 text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
          Plataforma
        </p>
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-400 transition-all hover:bg-white/5 hover:text-white"
        >
          <LayoutDashboard className="size-4 text-neutral-500" />
          Mi Dashboard
        </Link>
      </nav>

      {/* User profile footer */}
      <div className="border-t border-white/8 p-3">
        <div className="rounded-xl bg-white/5 p-3">
          <div className="flex items-center gap-3">
            <Avatar className="size-9 ring-2 ring-white/10">
              <AvatarImage src={user.image ?? undefined} alt={user.name} />
              <AvatarFallback className="bg-violet-900 text-sm text-violet-200">
                {user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{user.name}</p>
              <p className="truncate text-xs text-neutral-500">{user.email}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <Badge
              className={`border text-[10px] font-semibold uppercase tracking-wide ${roleBadgeClasses[profile.role] ?? "bg-neutral-700 text-neutral-300"}`}
            >
              {roleLabels[profile.role] ?? profile.role}
            </Badge>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-neutral-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
            >
              <LogOut className="size-3" />
              Salir
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
