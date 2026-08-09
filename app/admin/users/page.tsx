import { getAllUsersWithProfiles } from "@/app/actions/admin"
import { AdminUsersTable } from "@/components/admin-users-table"
import { Users } from "lucide-react"

export const metadata = {
  title: "Gestión de Usuarios — Admin | Collab",
}

export default async function AdminUsersPage() {
  const users = await getAllUsersWithProfiles()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Users className="size-5 text-violet-400" />
            <h1 className="text-2xl font-bold tracking-tight text-white">Gestión de Usuarios</h1>
          </div>
          <p className="mt-1 text-sm text-neutral-400">
            Busca usuarios, modifica roles globales y gestiona verificaciones institucionales.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/10 px-3 py-1.5">
          <Users className="size-3.5 text-violet-400" />
          <span className="text-xs font-semibold text-violet-300">
            {users.length} usuario{users.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Users table */}
      <AdminUsersTable users={users} />
    </div>
  )
}
