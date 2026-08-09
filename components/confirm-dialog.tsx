"use client"

import React, { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogMedia,
} from "@/components/ui/alert-dialog"
import { AlertTriangle, Loader2 } from "lucide-react"

interface ConfirmDialogProps {
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => Promise<void> | void
  variant?: "default" | "destructive"
  trigger?: React.ReactNode
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ConfirmDialog({
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  variant = "default",
  trigger,
  isOpen,
  onOpenChange,
}: ConfirmDialogProps) {
  const [isPending, setIsPending] = useState(false)
  const [internalOpen, setInternalOpen] = useState(false)

  const isControlled = isOpen !== undefined && onOpenChange !== undefined
  const open = isControlled ? isOpen : internalOpen
  const setOpen = isControlled ? onOpenChange : setInternalOpen

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault()
    setIsPending(true)
    try {
      await onConfirm()
      setOpen(false)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {trigger && React.isValidElement(trigger) ? (
        <AlertDialogTrigger render={trigger as React.ReactElement} />
      ) : trigger ? (
        <AlertDialogTrigger>{trigger}</AlertDialogTrigger>
      ) : null}
      <AlertDialogContent className="border-white/10 bg-neutral-950 sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogMedia className={variant === "destructive" ? "bg-red-500/10 text-red-500" : "bg-violet-500/10 text-violet-500"}>
            <AlertTriangle />
          </AlertDialogMedia>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isPending}
            className={variant === "destructive" ? "bg-red-600 hover:bg-red-700 text-white" : "bg-violet-600 hover:bg-violet-700 text-white"}
          >
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
