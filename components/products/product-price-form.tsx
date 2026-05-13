"use client"

import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { setPrice } from "@/lib/api"
import { formatCurrency } from "@/lib/utils"
import { ProductSectionCard } from "@/components/products/product-section-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field } from "@/components/shared/form-field"
import {
  type ProductPriceFormValues,
  productPriceFormSchema,
} from "./product-price-form.schema"

interface ProductPriceFormProps {
  productId: string
  currentPrice: string | null
}

export function ProductPriceForm({
  productId,
  currentPrice,
}: ProductPriceFormProps) {
  const queryClient = useQueryClient()
  const [activePrice, setActivePrice] = useState(currentPrice)
  const [submitting, setSubmitting] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductPriceFormValues>({
    resolver: standardSchemaResolver(productPriceFormSchema),
    defaultValues: {
      selling_price: undefined,
    },
  })

  async function onSubmit(values: ProductPriceFormValues) {
    setSubmitting(true)

    try {
      const nextPrice = await setPrice(productId, {
        selling_price: values.selling_price,
      })
      setActivePrice(nextPrice.selling_price)
      reset()
      await queryClient.invalidateQueries({ queryKey: ["productTableMetrics"] })
      toast.success("Precio actualizado correctamente")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudo actualizar el precio"
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ProductSectionCard
      title="Precio de venta"
      description="Registra un nuevo precio vigente sin afectar los datos base del producto."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="rounded-xl border bg-muted/40 px-4 py-3">
          <p className="text-sm text-muted-foreground">Precio vigente actual</p>
          <p className="mt-1 text-2xl font-semibold">{formatCurrency(activePrice)}</p>
        </div>

        <Field
          id="selling_price"
          label="Nuevo precio"
          error={errors.selling_price?.message}
        >
          <Input
            id="selling_price"
            type="number"
            min={0}
            step="0.01"
            placeholder="0.00"
            {...register("selling_price")}
          />
        </Field>

        <Button type="submit" disabled={submitting}>
          {submitting ? "Actualizando..." : "Actualizar precio"}
        </Button>
      </form>
    </ProductSectionCard>
  )
}
