import { z } from "zod"

export const productFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  barcode: z.string().min(1, "El código de barras es requerido"),
  category_id: z.string().min(1, "La categoría es requerida"),
  min_stock: z.coerce.number().int().min(0, "El stock mínimo debe ser mayor o igual a 0"),
  initial_stock: z.coerce.number().int().min(0, "El stock inicial debe ser mayor o igual a 0"),
  selling_price: z.coerce.number().min(0, "El precio debe ser mayor o igual a 0").optional(),
  is_active: z.boolean(),
})

export type ProductFormValues = z.infer<typeof productFormSchema>
