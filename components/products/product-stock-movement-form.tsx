"use client"

import { useMemo, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { createStockMovement } from "@/lib/api"
import { useMovementTypes } from "@/lib/queries"
import { ProductSectionCard } from "@/components/products/product-section-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Field } from "@/components/shared/form-field"
import { productStockMovementFormSchema } from "./product-stock-movement-form.schema"

interface ProductStockMovementFormProps {
  productId: string
  currentStock: number | null
}

interface ProductStockMovementFormState {
  operation: "" | "IN" | "OUT"
  type_id: string
  quantity: number | undefined
  reason: string
}

export function ProductStockMovementForm({
  productId,
  currentStock,
}: ProductStockMovementFormProps) {
  const queryClient = useQueryClient()
  const [stockQuantity, setStockQuantity] = useState(currentStock)
  const [submitting, setSubmitting] = useState(false)
  const { data: movementTypes, isLoading: movementTypesLoading } =
    useMovementTypes()
  const {
    control,
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProductStockMovementFormState>({
    resolver: standardSchemaResolver(productStockMovementFormSchema),
    defaultValues: {
      operation: "",
      type_id: "",
      quantity: 0,
      reason: "",
    },
  })

  const operation = useWatch({ control, name: "operation" })
  const quantity = useWatch({ control, name: "quantity" })
  const selectedTypeId = useWatch({ control, name: "type_id" })
  const normalizedQuantity = Number.isFinite(Number(quantity))
    ? Number(quantity)
    : 0
  const filteredMovementTypes = useMemo(
    () =>
      (movementTypes ?? []).filter(
        (movementType) =>
          movementType.operation === operation && movementType.code !== "SALE"
      ),
    [movementTypes, operation]
  )
  const projectedStock =
    stockQuantity === null
      ? null
      : operation === "IN"
        ? stockQuantity + normalizedQuantity
        : operation === "OUT"
          ? stockQuantity - normalizedQuantity
          : stockQuantity
  const exceedsStock =
    stockQuantity !== null &&
    operation === "OUT" &&
    normalizedQuantity > 0 &&
    projectedStock !== null &&
    projectedStock < 0
  const stockActionLabel =
    operation === "IN"
      ? "Entrada"
      : operation === "OUT"
        ? "Salida"
        : "Movimiento"

  async function onSubmit(values: ProductStockMovementFormState) {
    if (exceedsStock) {
      toast.error("La salida supera el stock actual")
      return
    }

    if (!values.quantity || !values.type_id || !values.operation) {
      return
    }

    setSubmitting(true)

    try {
      await createStockMovement({
        product_id: productId,
        type_id: values.type_id,
        quantity: values.quantity,
        reason: values.reason?.trim() || null,
      })

      if (projectedStock !== null) {
        setStockQuantity(projectedStock)
      }

      reset({
        operation: "",
        type_id: "",
        quantity: 0,
        reason: "",
      })

      await queryClient.invalidateQueries({ queryKey: ["productTableMetrics"] })
      await queryClient.invalidateQueries({ queryKey: ["stock", productId] })
      toast.success("Movimiento registrado correctamente")
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo registrar el movimiento"
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ProductSectionCard
      title="Stock actual"
      description="Registra una entrada o salida usando tipos de movimiento válidos para este producto."
    >
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <StockSummaryItem label="Actual" value={stockQuantity ?? "—"} accent />
          <StockSummaryItem
            label={stockActionLabel}
            value={normalizedQuantity > 0 ? normalizedQuantity : 0}
          />
          <StockSummaryItem
            label="Resultante"
            value={projectedStock ?? "—"}
            variant={exceedsStock ? "destructive" : "secondary"}
            showBadge
          />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field
              id="operation"
              label="Operación"
              error={errors.operation?.message}
            >
              <Select
                value={operation || undefined}
                onValueChange={(value: "IN" | "OUT") => {
                  setValue("operation", value, { shouldValidate: true })
                  setValue("type_id", "", { shouldValidate: true })
                }}
              >
                <SelectTrigger id="operation">
                  <SelectValue placeholder="Selecciona una operación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IN">Entrada</SelectItem>
                  <SelectItem value="OUT">Salida</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field
              id="type_id"
              label="Tipo de movimiento"
              error={errors.type_id?.message}
            >
              <Select
                value={selectedTypeId || undefined}
                onValueChange={(value) =>
                  setValue("type_id", value, { shouldValidate: true })
                }
                disabled={
                  movementTypesLoading ||
                  !operation ||
                  filteredMovementTypes.length === 0
                }
              >
                <SelectTrigger id="type_id">
                  <SelectValue
                    placeholder={
                      movementTypesLoading
                        ? "Cargando tipos..."
                        : "Selecciona un tipo"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {filteredMovementTypes.map((movementType) => (
                    <SelectItem key={movementType.id} value={movementType.id}>
                      {movementType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field
              id="quantity"
              label="Cantidad"
              error={errors.quantity?.message}
            >
              <Input
                id="quantity"
                type="number"
                min={1}
                step="1"
                disabled={!operation}
                {...register("quantity", { valueAsNumber: true })}
              />
            </Field>
          </div>

          <div className="grid gap-4">
            <Field
              id="reason"
              label="Motivo (opcional)"
              error={errors.reason?.message}
            >
              <Textarea
                id="reason"
                placeholder="Describe el motivo del movimiento"
                {...register("reason")}
              />
            </Field>
          </div>

          {!!operation &&
            filteredMovementTypes.length === 0 &&
            !movementTypesLoading && (
              <p className="text-sm text-muted-foreground">
                No hay tipos de movimiento disponibles para esta operación.
              </p>
            )}

          {exceedsStock && (
            <p className="text-sm text-destructive">
              La cantidad a retirar supera el stock actual disponible.
            </p>
          )}

          <Button
            type="submit"
            disabled={
              submitting ||
              movementTypesLoading ||
              !operation ||
              filteredMovementTypes.length === 0 ||
              exceedsStock
            }
          >
            {submitting ? "Registrando..." : "Registrar movimiento"}
          </Button>
        </form>
      </div>
    </ProductSectionCard>
  )
}

function StockSummaryItem({
  label,
  value,
  variant = "secondary",
  showBadge = false,
  accent = false,
}: {
  label: string
  value: number | string
  variant?: "secondary" | "outline" | "destructive"
  showBadge?: boolean
  accent?: boolean
}) {
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3",
        accent
          ? "border-primary/40 bg-primary/10"
          : "bg-muted/40"
      )}
    >
      <p className={cn("text-sm", accent ? "font-medium text-primary/80" : "text-muted-foreground")}>
        {label}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <span className={cn("text-2xl font-semibold", accent && "text-primary")}>
          {value}
        </span>
        {showBadge && <Badge variant={variant}>{label}</Badge>}
      </div>
    </div>
  )
}
