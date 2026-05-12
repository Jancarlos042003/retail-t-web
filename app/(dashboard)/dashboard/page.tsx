import {
  ShoppingCart01Icon,
  Money01Icon,
  AlertCircleIcon,
  Package01Icon,
} from "@hugeicons/core-free-icons"
import { fetchDashboardMetrics, fetchLowStockProducts } from "@/lib/api"
import { MetricCard } from "@/components/dashboard/metric-card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function DashboardPage() {
  const [metrics, lowStock] = await Promise.all([
    fetchDashboardMetrics().catch(() => ({
      total_sales_today: 0,
      total_revenue_today: 0,
      low_stock_count: 0,
      total_products: 0,
    })),
    fetchLowStockProducts().catch(() => []),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Resumen del negocio para hoy</p>
      </div>

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
              {lowStock.slice(0, 8).map((product) => (
                <div key={product.id} className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 rounded-md">
                    <AvatarImage src={product.image_url ?? undefined} alt={product.name} />
                    <AvatarFallback className="rounded-md text-xs">
                      {product.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.category.name}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge variant={product.stock_quantity === 0 ? "destructive" : "secondary"}>
                      {product.stock_quantity === 0
                        ? "Agotado"
                        : `${product.stock_quantity} / ${product.min_stock}`}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
