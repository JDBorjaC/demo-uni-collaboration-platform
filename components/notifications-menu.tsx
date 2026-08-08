"use client"

import useSWR from "swr"
import Link from "next/link"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { getMyNotifications, markAllNotificationsRead, markNotificationRead } from "@/app/actions/notifications"

export function NotificationsMenu() {
  const { data, mutate } = useSWR("notifications", getMyNotifications, { refreshInterval: 15000 })
  const notifications = data ?? []
  const unreadCount = notifications.filter((n) => !n.isRead).length

  async function handleOpenNotification(id: string) {
    await markNotificationRead(id)
    mutate()
  }

  async function handleMarkAll() {
    await markAllNotificationsRead()
    mutate()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="relative" />}>
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <Badge className="absolute -right-1 -top-1 h-5 min-w-5 justify-center rounded-full px-1 text-[10px]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
        <span className="sr-only">Notifications</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <button onClick={handleMarkAll} className="text-xs font-normal text-muted-foreground hover:text-foreground">
              Mark all read
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">No notifications yet</p>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((n) => (
              <DropdownMenuItem
                key={n.id}
                render={<Link href={n.link ?? "#"} onClick={() => handleOpenNotification(n.id)} />}
                className="cursor-pointer flex-col items-start gap-0.5 py-2"
              >
                <div className="flex w-full items-center gap-2">
                  {!n.isRead && <span className="size-1.5 shrink-0 rounded-full bg-primary" />}
                  <span className={`text-sm ${n.isRead ? "text-muted-foreground" : "font-medium text-foreground"}`}>
                    {n.title}
                  </span>
                </div>
                <span className="pl-3.5 text-xs text-muted-foreground">{n.message}</span>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
