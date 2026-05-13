"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { fetchCurrentPrice, fetchStockLevel } from "@/lib/api"
import type { ProductReadWithCategory } from "@/lib/types"

interface ProductTableMetric {
  price: string | null
  stock: number | null
}

export function useProductTableMetrics(products: ProductReadWithCategory[]) {
  const productIds = products.map((product) => product.id)

  return useQuery({
    queryKey: ["productTableMetrics", productIds],
    queryFn: async () => {
      const metrics = await Promise.all(
        products.map(async (product) => {
          const [price, stock] = await Promise.all([
            fetchCurrentPrice(product.id).catch(() => null),
            fetchStockLevel(product.id).catch(() => null),
          ])

          return [
            product.id,
            {
              price: price?.selling_price ?? null,
              stock: stock?.quantity ?? null,
            } satisfies ProductTableMetric,
          ] as const
        })
      )

      return new Map<string, ProductTableMetric>(metrics)
    },
    enabled: products.length > 0,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  })
}
