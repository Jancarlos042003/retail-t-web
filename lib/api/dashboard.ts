import type { ProductReadWithMetrics } from "../types"
import { fetchProducts } from "./products"
import { fetchSalesToday } from "./sales"

export async function fetchDashboardData() {
  const [salesToday, products] = await Promise.all([
    fetchSalesToday(),
    fetchProducts(true, { include_stock: true }),
  ])

  const completedSales = salesToday.filter((s) => s.status === "COMPLETED")
  const totalRevenue = completedSales.reduce((acc, s) => acc + parseFloat(s.total_amount), 0)

  const lowStock = products.filter((p) => {
    const qty = p.stock_quantity
    return qty !== null && qty > 0 && qty <= p.min_stock
  })

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

export async function fetchLowStockProducts(): Promise<ProductReadWithMetrics[]> {
  const products = await fetchProducts(true, { include_stock: true })
  return products.filter((p) => {
    const qty = p.stock_quantity
    return qty !== null && qty > 0 && qty <= p.min_stock
  })
}

export async function fetchDashboardMetrics() {
  const [salesToday, products] = await Promise.all([
    fetchSalesToday(),
    fetchProducts(true, { include_stock: true }),
  ])

  const completedSales = salesToday.filter((s) => s.status === "COMPLETED")
  const totalRevenue = completedSales.reduce((acc, s) => acc + parseFloat(s.total_amount), 0)

  const lowStockCount = products.filter((p) => {
    const qty = p.stock_quantity
    return qty !== null && qty > 0 && qty <= p.min_stock
  }).length

  return {
    total_sales_today: completedSales.length,
    total_revenue_today: totalRevenue,
    low_stock_count: lowStockCount,
    total_products: products.length,
  }
}
