import { fetchSalesToday } from "@/lib/api"
import { PageHeader } from "@/components/shared/page-header"
import { SalesTable } from "@/components/sales/sales-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function VentasPage() {
  const sales = await fetchSalesToday()

  const completed = sales.filter((s) => s.status === "COMPLETED")
  const totalRevenue = completed.reduce((acc, s) => acc + parseFloat(s.total_amount), 0)

  const todayLabel = new Date().toLocaleDateString("es-PE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="space-y-5">
      <PageHeader title="Ventas del día" description={todayLabel} />

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
