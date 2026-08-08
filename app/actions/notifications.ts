"use server"

import { db } from "@/lib/db"
import { notifications } from "@/lib/db/schema"
import { getUserId } from "@/lib/permissions"
import { and, desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function getMyNotifications() {
  const userId = await getUserId()
  return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)).limit(30)
}

export async function markNotificationRead(id: string) {
  const userId = await getUserId()
  await db.update(notifications).set({ isRead: true }).where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
  revalidatePath("/dashboard")
}

export async function markAllNotificationsRead() {
  const userId = await getUserId()
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId))
  revalidatePath("/dashboard")
}
