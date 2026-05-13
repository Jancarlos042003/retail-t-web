import {
  ShoppingCart01Icon,
  Money01Icon,
  AlertCircleIcon,
  Package01Icon,
} from "@hugeicons/core-free-icons"
import { fetchDashboardData } from "@/lib/api"
import { getStockStatus } from "@/lib/stock-utils"
import { MetricCard } from "@/components/dashboard/metric-card"
import { ProductAvatar } from "@/components/shared/product-avatar"
import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function DashboardPage() {
  const { metrics, lowStock } = await fetchDashboardData().catch(() => ({
    metrics: { total_sales_today: 0, total_revenue_today: 0, low_stock_count: 0, total_products: 0 },
    lowStock: [],
  }))

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Resumen del negocio para hoy" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Ventas del día"
          value={metrics.total_sales_today}
          description="Transacciones completadas hoy"
          icon={ShoppingCart01Icon}
        />
        <MetricCard
          title="Ingresos del día"
          value={`S/ ${metrics.total_revenue_today.toFixed(2)}`}
          description="Total facturado hoy"
          icon={Money01Icon}
        />
        <MetricCard
          title="Stock bajo"
          value={metrics.low_stock_count}
          description="Productos por reponer"
          icon={AlertCircleIcon}
        />
        <MetricCard
          title="Productos activos"
          value={metrics.total_products}
          description="En catálogo"
          icon={Package01Icon}
        />
      </div>

      {lowStock.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Productos con stock bajo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStock.slice(0, 8).map((product) => {
                const status = getStockStatus(product.stock_quantity, product.min_stock)
                return (
                  <div key={product.id} className="flex items-center gap-3">
                    <ProductAvatar imageUrl={product.image_url} name={product.name} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.category.name}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge variant={status.variant}>
                        {product.stock_quantity === 0
                          ? status.label
                          : `${product.stock_quantity} / ${product.min_stock}`}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
