"use client"

import { Button } from "@/components/ui/button"

interface ErrorStateProps {
  title?: string
  description?: string
  retry?: () => void
}

export function ErrorState({
  title = "Algo salió mal",
  description = "No se pudieron cargar los datos. Intenta de nuevo.",
  retry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
      <p className="text-lg font-semibold">{title}</p>
      <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
      {retry && (
        <Button variant="outline" onClick={retry}>
          Reintentar
        </Button>
      )}
    </div>
  )
}
