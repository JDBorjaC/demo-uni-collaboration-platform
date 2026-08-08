import { db } from "@/lib/db"
import { auditLogs } from "@/lib/db/schema"
import { nanoid } from "nanoid"

export async function logAudit(params: {
  actorId: string | null
  action: string
  entityType: string
  entityId: string
  metadata?: Record<string, unknown>
}) {
  await db.insert(auditLogs).values({
    id: nanoid(),
    actorId: params.actorId,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId,
    metadata: params.metadata ?? null,
  })
}
