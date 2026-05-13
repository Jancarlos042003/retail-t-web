export type StockStatusLabel = "Sin datos" | "Agotado" | "Stock bajo" | "OK"
export type StockStatusVariant = "outline" | "destructive" | "secondary" | "default"

export interface StockStatus {
  label: StockStatusLabel
  variant: StockStatusVariant
}

export function getStockStatus(quantity: number | null, minStock: number): StockStatus {
  if (quantity === null) return { label: "Sin datos", variant: "outline" }
  if (quantity === 0) return { label: "Agotado", variant: "destructive" }
  if (quantity <= minStock) return { label: "Stock bajo", variant: "secondary" }
  return { label: "OK", variant: "default" }
}
