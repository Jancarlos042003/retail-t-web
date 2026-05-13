"use client"

import { ErrorState } from "@/components/shared/error-state"

export default function DashboardError({ reset }: { reset: () => void }) {
  return (
    <ErrorState
      title="No se pudo cargar la sección"
      description="Ocurrió un error al obtener los datos. Verifica tu conexión e intenta de nuevo."
      retry={reset}
    />
  )
}
