import { fetchSalesToday } from "@/lib/api"
import { SalesTable } from "@/components/sales/sales-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function VentasPage() {
  const sales = await fetchSalesToday().catch(() => [])

  const completed = sales.filter((s) => s.status === "COMPLETED")
  const totalRevenue = completed.reduce((acc, s) => acc + parseFloat(s.total_amount), 0)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Ventas del día</h1>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString("es-PE", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ventas completadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{completed.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total facturado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">S/ {totalRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <SalesTable sales={sales} />
    </div>
  )
}
