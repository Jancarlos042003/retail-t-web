"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
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

const schema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  barcode: z.string().min(1, "El código de barras es requerido"),
  category_id: z.string().min(1, "La categoría es requerida"),
  min_stock: z.coerce
    .number()
    .int()
    .min(0, "El stock mínimo debe ser mayor o igual a 0"),
  initial_stock: z.coerce
    .number()
    .int()
    .min(0, "El stock inicial debe ser mayor o igual a 0"),
  selling_price: z.coerce
    .number()
    .min(0, "El precio debe ser mayor o igual a 0")
    .optional(),
  is_active: z.boolean(),
})

type FormValues = z.infer<typeof schema>

interface ProductFormProps {
  categories: CategoryRead[]
  product?: ProductReadWithCategory
}

export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const { imageFile, imagePreview, handleImageChange } = useProductImage(
    product?.image_url
  )
  const { data: movementTypes } = useMovementTypes()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: standardSchemaResolver(schema),
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

  const isActive = watch("is_active")

  async function handleCreate(values: FormValues) {
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

  async function handleUpdate(id: string, values: FormValues) {
    await updateProduct(id, {
      name: values.name,
      barcode: values.barcode,
      category_id: values.category_id,
      min_stock: values.min_stock,
      is_active: values.is_active,
    })
    toast.success("Producto actualizado correctamente")
  }

  async function onSubmit(values: FormValues) {
    setSubmitting(true)
    try {
      if (product) {
        await handleUpdate(product.id, values)
      } else {
        await handleCreate(values)
      }
      router.push("/productos")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ocurrió un error")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="name">Nombre del producto</Label>
        <Input id="name" {...register("name")} placeholder="Inca Kola 500ml" />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="barcode">Código de barras</Label>
        <Input
          id="barcode"
          {...register("barcode")}
          placeholder="7501234567890"
        />
        {errors.barcode && (
          <p className="text-xs text-destructive">{errors.barcode.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="category">Categoría</Label>
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
        {errors.category_id && (
          <p className="text-xs text-destructive">
            {errors.category_id.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="min_stock">Stock mínimo</Label>
        <Input
          id="min_stock"
          type="number"
          min={0}
          {...register("min_stock")}
        />
        {errors.min_stock && (
          <p className="text-xs text-destructive">{errors.min_stock.message}</p>
        )}
      </div>

      {!product && (
        <div className="space-y-1.5">
          <Label htmlFor="initial_stock">Stock inicial</Label>
          <Input
            id="initial_stock"
            type="number"
            min={0}
            {...register("initial_stock")}
          />
          {errors.initial_stock && (
            <p className="text-xs text-destructive">
              {errors.initial_stock.message}
            </p>
          )}
        </div>
      )}

      {!product && (
        <div className="space-y-1.5">
          <Label htmlFor="selling_price">Precio de venta</Label>
          <Input
            id="selling_price"
            type="number"
            min={0}
            step="0.01"
            placeholder="0.00"
            {...register("selling_price")}
          />
          {errors.selling_price && (
            <p className="text-xs text-destructive">
              {errors.selling_price.message}
            </p>
          )}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="image">Imagen del producto</Label>
        <Input
          id="image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="max-w-xs"
        />
        {imagePreview && (
          <div className="mt-2">
            <img
              src={imagePreview}
              alt="Vista previa"
              className="h-60 w-auto rounded-md border border-border object-cover"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
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

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={submitting}>
          {submitting
            ? "Guardando..."
            : product
              ? "Guardar cambios"
              : "Crear producto"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={submitting}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
