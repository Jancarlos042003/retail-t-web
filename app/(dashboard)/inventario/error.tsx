"use client"

import { ErrorState } from "@/components/shared/error-state"

interface ErrorPageProps {
  reset: () => void
}

export default function InventarioError({ reset }: ErrorPageProps) {
  return (
    <ErrorState
      title="No se pudo cargar el inventario"
      description="Ocurrió un error al obtener el estado del stock."
      retry={reset}
    />
  )
}
