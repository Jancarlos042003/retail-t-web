import { z } from "zod"

export const productPriceFormSchema = z.object({
  selling_price: z.coerce.number().positive("El precio debe ser mayor a 0"),
})

export type ProductPriceFormValues = z.infer<typeof productPriceFormSchema>
