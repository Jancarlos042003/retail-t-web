"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { toast } from "sonner"
import {
  createProduct,
  createStockMovement,
  setPrice,
  updateProduct,
} from "@/lib/api"
import { useMovementTypes } from "@/lib/queries"
import { useProductImage } from "@/hooks/use-product-image"
import type { CategoryRead, ProductReadWithCategory } from "@/lib/types"
import { ProductSectionCard } from "@/components/products/product-section-card"
import { Field } from "@/components/shared/form-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  type ProductFormValues,
  productFormSchema,
} from "./product-form.schema"

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductFormProps {
  categories: CategoryRead[]
  product?: ProductReadWithCategory
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const { imageFile, imagePreview, handleImageChange } = useProductImage(
    product?.image_url
  )
  const { data: movementTypes } = useMovementTypes()

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: standardSchemaResolver(productFormSchema),
    defaultValues: {
      name: product?.name ?? "",
      barcode: product?.barcode ?? "",
      category_id: product?.category_id ?? "",
      min_stock: product?.min_stock ?? 0,
      initial_stock: 0,
      selling_price: undefined,
      is_active: product?.is_active ?? true,
    },
  })

  const isActive = useWatch({ control, name: "is_active" })

  // ─── Submit handlers ────────────────────────────────────────────────────────

  async function handleCreate(values: ProductFormValues) {
    const created = await createProduct({
      name: values.name,
      barcode: values.barcode,
      category_id: values.category_id,
      min_stock: values.min_stock,
      is_active: values.is_active,
      image: imageFile,
    })
    if (values.initial_stock > 0) {
      const adjustmentType = movementTypes?.find(
        (t) => t.code === "INVENTORY_ADJUSTMENT_POS"
      )
      if (!adjustmentType)
        throw new Error("Tipo de movimiento de ajuste positivo no encontrado")
      await createStockMovement({
        product_id: created.id,
        type_id: adjustmentType.id,
        quantity: values.initial_stock,
        reason: "Stock inicial",
      })
    }
    if (values.selling_price !== undefined && values.selling_price > 0) {
      await setPrice(created.id, { selling_price: values.selling_price })
    }
    toast.success("Producto creado correctamente")
  }

  async function handleUpdate(id: string, values: ProductFormValues) {
    await updateProduct(id, {
      name: values.name,
      barcode: values.barcode,
      category_id: values.category_id,
      min_stock: values.min_stock,
      is_active: values.is_active,
    })
    toast.success("Producto actualizado correctamente")
  }

  async function onSubmit(values: ProductFormValues) {
    setSubmitting(true)
    try {
      if (product) {
        await handleUpdate(product.id, values)
        router.refresh()
      } else {
        await handleCreate(values)
        router.push("/productos")
        router.refresh()
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ocurrió un error")
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <ProductSectionCard
      title={product ? "Datos del producto" : "Nuevo producto"}
      description={
        product
          ? "Actualiza la información base del producto sin afectar precio ni stock."
          : "Completa la información principal del producto para registrarlo en el catálogo."
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="w-auto space-y-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-5">
            <Field
              id="name"
              label="Nombre del producto"
              error={errors.name?.message}
            >
              <Input
                id="name"
                {...register("name")}
                placeholder="Inca Kola 500ml"
              />
            </Field>

            <Field
              id="barcode"
              label="Código de barras"
              error={errors.barcode?.message}
            >
              <Input
                id="barcode"
                {...register("barcode")}
                placeholder="7501234567890"
              />
            </Field>

            <Field
              id="category"
              label="Categoría"
              error={errors.category_id?.message}
            >
              <Select
                defaultValue={product?.category_id}
                onValueChange={(val) => setValue("category_id", val)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field id="image" label="Imagen del producto">
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Vista previa"
                  className="mt-2 h-48 w-auto rounded-md border border-border object-cover"
                />
              )}
            </Field>
          </div>

          <div className="space-y-5">
            {!product && (
              <Field
                id="initial_stock"
                label="Stock inicial"
                error={errors.initial_stock?.message}
              >
                <Input
                  id="initial_stock"
                  type="number"
                  min={0}
                  {...register("initial_stock")}
                />
              </Field>
            )}

            <Field
              id="min_stock"
              label="Stock mínimo"
              error={errors.min_stock?.message}
            >
              <Input
                id="min_stock"
                type="number"
                min={0}
                {...register("min_stock")}
              />
            </Field>

            {!product && (
              <Field
                id="selling_price"
                label="Precio de venta"
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
            )}

            <div className="flex items-center gap-2 pt-1">
              <input
                id="is_active"
                type="checkbox"
                className="h-4 w-4 rounded border-input accent-primary"
                checked={isActive}
                onChange={(e) => setValue("is_active", e.target.checked)}
              />
              <Label htmlFor="is_active">
                Producto activo (disponible para venta)
              </Label>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={submitting}>
            {submitting
              ? "Guardando..."
              : product
                ? "Guardar cambios"
                : "Crear producto"}
          </Button>
          {!product && (
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={submitting}
            >
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </ProductSectionCard>
  )
}
