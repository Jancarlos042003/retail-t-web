import { useQuery } from "@tanstack/react-query"
import {
  fetchCategories,
  fetchMovementTypes,
  fetchPaymentMethods,
  fetchProducts,
  fetchStockLevel,
} from "./api"

export const queryKeys = {
  categories: () => ["categories"] as const,
  products: (isActive?: boolean) => ["products", isActive] as const,
  stockLevel: (productId: string) => ["stock", productId] as const,
  movementTypes: () => ["movementTypes"] as const,
  paymentMethods: () => ["paymentMethods"] as const,
}

export function useMovementTypes() {
  return useQuery({
    queryKey: queryKeys.movementTypes(),
    queryFn: fetchMovementTypes,
    staleTime: Infinity,
  })
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories(),
    queryFn: fetchCategories,
    staleTime: Infinity,
  })
}

export function usePaymentMethods() {
  return useQuery({
    queryKey: queryKeys.paymentMethods(),
    queryFn: fetchPaymentMethods,
    staleTime: Infinity,
  })
}

export function useProducts(isActive?: boolean) {
  return useQuery({
    queryKey: queryKeys.products(isActive),
    queryFn: () => fetchProducts(isActive),
  })
}

export function useStockLevel(productId: string) {
  return useQuery({
    queryKey: queryKeys.stockLevel(productId),
    queryFn: () => fetchStockLevel(productId),
  })
}
