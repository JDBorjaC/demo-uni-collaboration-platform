"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { subscribeToProject, unsubscribeFromProject } from "@/app/actions/projects"
import { Button } from "@/components/ui/button"
import { Bell, BellOff, LogIn } from "lucide-react"
import Link from "next/link"

interface SubscribeButtonProps {
  projectId: string
  isLoggedIn: boolean
  isSubscribed: boolean
}

export function SubscribeButton({ projectId, isLoggedIn, isSubscribed }: SubscribeButtonProps) {
  const [isPending, startTransition] = useTransition()

  if (!isLoggedIn) {
    return (
      <Button variant="outline" render={<Link href="/sign-in" />} className="gap-2">
        <Bell className="size-4" />
        Seguir proyecto
      </Button>
    )
  }

  function handleToggle() {
    startTransition(async () => {
      const result = isSubscribed
        ? await unsubscribeFromProject(projectId)
        : await subscribeToProject(projectId)

      if (result.success) {
        toast.success(isSubscribed ? "Dejaste de seguir este proyecto." : "¡Ahora sigues este proyecto!")
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Button
      variant={isSubscribed ? "secondary" : "outline"}
      onClick={handleToggle}
      disabled={isPending}
      className="gap-2"
    >
      {isPending ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : isSubscribed ? (
        <BellOff className="size-4" />
      ) : (
        <Bell className="size-4" />
      )}
      {isSubscribed ? "Dejar de seguir" : "Seguir proyecto"}
    </Button>
  )
}
