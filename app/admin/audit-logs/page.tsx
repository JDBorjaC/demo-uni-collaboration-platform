import { getAuditLogs } from "@/app/actions/admin"
import { AdminAuditLogs } from "@/components/admin-audit-logs"
import { ScrollText } from "lucide-react"

export const metadata = {
  title: "Audit Logs — Admin | Collab",
}

export default async function AuditLogsPage() {
  const logs = await getAuditLogs(200)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ScrollText className="size-5 text-sky-400" />
            <h1 className="text-2xl font-bold tracking-tight text-white">Registros de Auditoría</h1>
          </div>
          <p className="mt-1 text-sm text-neutral-400">
            Historial completo de acciones sobre la plataforma. Los admins pueden revertir cambios con un motivo expreso.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-sky-500/25 bg-sky-500/10 px-3 py-1.5">
          <ScrollText className="size-3.5 text-sky-400" />
          <span className="text-xs font-semibold text-sky-300">
            {logs.length} registro{logs.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <AdminAuditLogs logs={logs} />
    </div>
  )
}
