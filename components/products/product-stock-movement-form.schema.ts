import { z } from "zod"

export const productStockMovementFormSchema = z.object({
  operation: z.enum(["IN", "OUT"], {
    message: "Selecciona una operación",
  }),
  type_id: z.string().min(1, "Selecciona un tipo de movimiento"),
  quantity: z.coerce.number().int().positive("La cantidad debe ser mayor a 0"),
  reason: z.string().trim().max(255, "El motivo es demasiado largo").optional(),
})

/** Tipo inferido del schema — representa los valores una vez validados. */
export type ProductStockMovementFormValues = z.infer<typeof productStockMovementFormSchema>

/**
 * Tipo del estado interno del formulario.
 * `operation` puede ser `""` antes de que el usuario seleccione un valor,
 * por eso se mantiene separado del tipo de salida del schema.
 */
export interface ProductStockMovementFormState {
  operation: "" | "IN" | "OUT"
  type_id: string
  quantity: number
  reason: string
}
