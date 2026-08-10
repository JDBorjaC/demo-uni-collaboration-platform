"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { applyToProject } from "@/app/actions/applications"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Send, UserCheck, Clock, LogIn } from "lucide-react"
import Link from "next/link"

type ApplyState =
  | { kind: "guest" }
  | { kind: "member" }
  | { kind: "pending" }
  | { kind: "can_apply" }

interface ApplyButtonProps {
  projectId: string
  projectTitle: string
  state: ApplyState
}

export function ApplyButton({ projectId, projectTitle, state }: ApplyButtonProps) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [isPending, startTransition] = useTransition()

  if (state.kind === "guest") {
    return (
      <Button render={<Link href={`/sign-in?callbackURL=/projects`} />} className="gap-2 shadow-sm shadow-primary/30">
        <LogIn className="size-4" />
        Iniciar sesión para aplicar
      </Button>
    )
  }

  if (state.kind === "member") {
    return (
      <Button variant="secondary" disabled className="gap-2">
        <UserCheck className="size-4" />
        Ya eres miembro
      </Button>
    )
  }

  if (state.kind === "pending") {
    return (
      <Button variant="secondary" disabled className="gap-2">
        <Clock className="size-4" />
        Solicitud enviada
      </Button>
    )
  }

  function handleSubmit() {
    if (message.trim().length < 10) {
      toast.error("Tu mensaje debe tener al menos 10 caracteres.")
      return
    }
    startTransition(async () => {
      const result = await applyToProject({ projectId, message: message.trim() })
      if (result.success) {
        toast.success("¡Solicitud enviada! El líder del proyecto será notificado.")
        setOpen(false)
        setMessage("")
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2 shadow-sm shadow-primary/30">
        <Send className="size-4" />
        Solicitar colaboración
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Solicitar unirse al proyecto</DialogTitle>
            <DialogDescription>
              Cuéntale al líder de <span className="font-medium text-foreground">"{projectTitle}"</span> por qué quieres colaborar.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 pt-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="apply-message">Tu mensaje</Label>
              <Textarea
                id="apply-message"
                placeholder="Describe tus habilidades, motivación y lo que aportarías al proyecto..."
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="resize-none"
                disabled={isPending}
              />
              <p className="text-right text-xs text-muted-foreground">
                {message.length}/1000
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isPending || message.trim().length < 10}
                className="gap-2"
              >
                {isPending ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="size-4" />
                    Enviar solicitud
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
