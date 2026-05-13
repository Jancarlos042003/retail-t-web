import type {
  MovementTypeRead,
  StockLevelRead,
  StockMovementCreate,
  StockMovementRead,
} from "../types"
import { apiFetch } from "./base"

export function fetchMovementTypes(): Promise<MovementTypeRead[]> {
  return apiFetch("/stock/movement-types")
}

export function fetchStockLevel(productId: string): Promise<StockLevelRead> {
  return apiFetch(`/stock/${productId}`)
}

export function fetchStockMovements(productId: string): Promise<StockMovementRead[]> {
  return apiFetch(`/stock/${productId}/movements`)
}

export function createStockMovement(data: StockMovementCreate): Promise<StockMovementRead> {
  return apiFetch("/stock/movements", { method: "POST", body: JSON.stringify(data) })
}
