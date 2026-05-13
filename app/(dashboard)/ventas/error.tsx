"use client"

import { ErrorState } from "@/components/shared/error-state"

interface ErrorPageProps {
  reset: () => void
}

export default function VentasError({ reset }: ErrorPageProps) {
  return (
    <ErrorState
      title="No se pudo cargar las ventas"
      description="Ocurrió un error al obtener las ventas del día."
      retry={reset}
    />
  )
}
