"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { toast } from "sonner"
import { createProduct, updateProduct } from "@/lib/api"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const schema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  barcode: z.string().min(1, "El código de barras es requerido"),
  category_id: z.string().min(1, "La categoría es requerida"),
  min_stock: z.coerce.number().int().min(0, "El stock mínimo debe ser mayor o igual a 0"),
  is_active: z.boolean(),
})

type FormValues = z.infer<typeof schema>

interface ProductFormProps {
  categories: CategoryRead[]
  product?: ProductReadWithCategory
}

export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(product?.image_url ?? null)
  const [submitting, setSubmitting] = useState(false)

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
      is_active: product?.is_active ?? true,
    },
  })

  const isActive = watch("is_active")

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function onSubmit(values: FormValues) {
    setSubmitting(true)
    try {
      if (product) {
        await updateProduct(product.id, {
          name: values.name,
          barcode: values.barcode,
          category_id: values.category_id,
          min_stock: values.min_stock,
          is_active: values.is_active,
        })
        toast.success("Producto actualizado correctamente")
      } else {
        await createProduct({
          ...values,
          image: imageFile,
        })
        toast.success("Producto creado correctamente")
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-xl">
      <div className="space-y-1.5">
        <Label htmlFor="name">Nombre del producto</Label>
        <Input id="name" {...register("name")} placeholder="Inca Kola 500ml" />
        {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="barcode">Código de barras</Label>
        <Input id="barcode" {...register("barcode")} placeholder="7501234567890" />
        {errors.barcode && <p className="text-destructive text-xs">{errors.barcode.message}</p>}
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
          <p className="text-destructive text-xs">{errors.category_id.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="min_stock">Stock mínimo</Label>
        <Input id="min_stock" type="number" min={0} {...register("min_stock")} />
        {errors.min_stock && <p className="text-destructive text-xs">{errors.min_stock.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="image">Imagen del producto</Label>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 rounded-md">
            <AvatarImage src={imagePreview ?? undefined} alt="Vista previa" />
            <AvatarFallback className="rounded-md text-xs text-muted-foreground">
              Sin imagen
            </AvatarFallback>
          </Avatar>
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="max-w-xs"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="is_active"
          type="checkbox"
          className="h-4 w-4 rounded border-input accent-primary"
          checked={isActive}
          onChange={(e) => setValue("is_active", e.target.checked)}
        />
        <Label htmlFor="is_active">Producto activo (disponible para venta)</Label>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Guardando..." : product ? "Guardar cambios" : "Crear producto"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={submitting}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
