"use client"

import { ErrorState } from "@/components/shared/error-state"

interface ErrorPageProps {
  reset: () => void
}

export default function ProductosError({ reset }: ErrorPageProps) {
  return (
    <ErrorState
      title="No se pudo cargar los productos"
      description="Ocurrió un error al obtener la lista de productos."
      retry={reset}
    />
  )
}
