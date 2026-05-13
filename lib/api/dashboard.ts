import type { ProductReadWithCategory, StockLevelRead } from "../types"
import { fetchProducts } from "./products"
import { fetchStockLevel } from "./inventory"
import { fetchSalesToday } from "./sales"

export async function fetchDashboardData() {
  const [salesToday, products] = await Promise.all([fetchSalesToday(), fetchProducts(true)])

  const completedSales = salesToday.filter((s) => s.status === "COMPLETED")
  const totalRevenue = completedSales.reduce((acc, s) => acc + parseFloat(s.total_amount), 0)

  const stockResults = await Promise.allSettled(products.map((p) => fetchStockLevel(p.id)))
  const stockMap = new Map(
    stockResults
      .filter((r): r is PromiseFulfilledResult<StockLevelRead> => r.status === "fulfilled")
      .map((r) => [r.value.product_id, r.value.quantity])
  )

  const lowStock = products
    .filter((p) => (stockMap.get(p.id) ?? Infinity) <= p.min_stock)
    .map((p) => ({ ...p, stock_quantity: stockMap.get(p.id) ?? 0 }))

  return {
    metrics: {
      total_sales_today: completedSales.length,
      total_revenue_today: totalRevenue,
      low_stock_count: lowStock.length,
      total_products: products.length,
    },
    lowStock,
  }
}

export async function fetchLowStockProducts(): Promise<
  (ProductReadWithCategory & { stock_quantity: number })[]
> {
  const products = await fetchProducts(true)
  const stockResults = await Promise.allSettled(
    products.map((p) => fetchStockLevel(p.id).then((s) => ({ ...p, stock_quantity: s.quantity })))
  )
  return stockResults
    .filter((r): r is PromiseFulfilledResult<ProductReadWithCategory & { stock_quantity: number }> => r.status === "fulfilled")
    .map((r) => r.value)
    .filter((p) => p.stock_quantity <= p.min_stock)
}

export async function fetchDashboardMetrics() {
  const [salesToday, products] = await Promise.all([fetchSalesToday(), fetchProducts(true)])

  const completedSales = salesToday.filter((s) => s.status === "COMPLETED")
  const totalRevenue = completedSales.reduce((acc, s) => acc + parseFloat(s.total_amount), 0)

  const stockResults = await Promise.allSettled(products.map((p) => fetchStockLevel(p.id)))
  const stockMap = new Map(
    stockResults
      .filter((r): r is PromiseFulfilledResult<StockLevelRead> => r.status === "fulfilled")
      .map((r) => [r.value.product_id, r.value.quantity])
  )

  const lowStockCount = products.filter((p) => (stockMap.get(p.id) ?? Infinity) <= p.min_stock).length

  return {
    total_sales_today: completedSales.length,
    total_revenue_today: totalRevenue,
    low_stock_count: lowStockCount,
    total_products: products.length,
  }
}
