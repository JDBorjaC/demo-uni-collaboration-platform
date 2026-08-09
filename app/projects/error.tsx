"use client"

import { useEffect } from "react"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ProjectsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Projects error:", error)
  }, [error])

  return (
    <div className="mx-auto flex min-h-[400px] w-full max-w-7xl flex-col items-center justify-center p-4 sm:min-h-[500px]">
      <div className="flex max-w-md flex-col items-center text-center">
        <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-red-500/10">
          <AlertCircle className="size-8 text-red-500" />
        </div>
        <h2 className="mb-2 text-2xl font-bold tracking-tight text-white">Oops, algo salió mal</h2>
        <p className="mb-6 text-sm text-neutral-400">
          Ha ocurrido un error inesperado al cargar la sección de proyectos.
          {error.message && (
            <span className="mt-2 block rounded bg-black/20 p-2 font-mono text-xs text-red-400">
              {error.message}
            </span>
          )}
        </p>
        <Button
          onClick={() => reset()}
          className="bg-red-600 text-white hover:bg-red-700"
        >
          <RefreshCw className="mr-2 size-4" />
          Intentar nuevamente
        </Button>
      </div>
    </div>
  )
}
