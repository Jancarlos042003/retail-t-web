import { z } from "zod"

export const productStockMovementFormSchema = z.object({
  operation: z
    .string()
    .min(1, "Selecciona una operación")
    .refine((value) => value === "IN" || value === "OUT", {
      message: "Selecciona una operación",
    }),
  type_id: z.string().min(1, "Selecciona un tipo de movimiento"),
  quantity: z.coerce.number().int().positive("La cantidad debe ser mayor a 0"),
  reason: z.string().trim().max(255, "El motivo es demasiado largo").optional(),
})

export type ProductStockMovementFormValues = z.infer<typeof productStockMovementFormSchema>
