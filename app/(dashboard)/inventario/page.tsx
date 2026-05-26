import { fetchProducts } from "@/lib/api"
import { getStockStatus } from "@/lib/stock-utils"
import { ProductAvatar } from "@/components/shared/product-avatar"
import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default async function InventarioPage() {
  const products = await fetchProducts(true, { include_stock: true })

  const lowStock = products.filter(
    (p) => p.stock_quantity !== null && p.stock_quantity > 0 && p.stock_quantity <= p.min_stock
  )
  const outOfStock = products.filter((p) => p.stock_quantity === 0)

  return (
    <div className="space-y-6">
      <PageHeader title="Inventario" description="Estado actual del stock de productos" />

      {(outOfStock.length > 0 || lowStock.length > 0) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {outOfStock.length > 0 && (
            <Card className="border-destructive/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-destructive">
                  Agotados ({outOfStock.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {outOfStock.slice(0, 5).map((p) => (
                    <p key={p.id} className="text-sm truncate">{p.name}</p>
                  ))}
                  {outOfStock.length > 5 && (
                    <p className="text-xs text-muted-foreground">+{outOfStock.length - 5} más</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          {lowStock.length > 0 && (
            <Card className="border-yellow-500/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                  Stock bajo ({lowStock.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {lowStock.slice(0, 5).map((p) => (
                    <p key={p.id} className="text-sm truncate">{p.name}</p>
                  ))}
                  {lowStock.length > 5 && (
                    <p className="text-xs text-muted-foreground">+{lowStock.length - 5} más</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Producto</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Stock actual</TableHead>
            <TableHead>Stock mínimo</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                No hay productos registrados
              </TableCell>
            </TableRow>
          )}
          {products.map((product) => {
            const status = getStockStatus(product.stock_quantity, product.min_stock)
            return (
              <TableRow key={product.id}>
                <TableCell>
                  <ProductAvatar imageUrl={product.image_url} name={product.name} />
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.category.name}</TableCell>
                <TableCell className="font-mono">{product.stock_quantity ?? "—"}</TableCell>
                <TableCell className="font-mono">{product.min_stock}</TableCell>
                <TableCell>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
