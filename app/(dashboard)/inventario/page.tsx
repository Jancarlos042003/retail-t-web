import { fetchProducts, fetchStockLevel } from "@/lib/api"
import type { ProductReadWithCategory, StockLevelRead } from "@/lib/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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

type ProductWithStock = ProductReadWithCategory & { stock: StockLevelRead | null }

function getStockStatus(product: ProductWithStock) {
  if (!product.stock) return { label: "Sin datos", variant: "outline" as const }
  if (product.stock.quantity === 0) return { label: "Agotado", variant: "destructive" as const }
  if (product.stock.quantity <= product.min_stock) return { label: "Stock bajo", variant: "secondary" as const }
  return { label: "OK", variant: "default" as const }
}

export default async function InventarioPage() {
  const products = await fetchProducts(true).catch(() => [] as ProductReadWithCategory[])

  const stockResults = await Promise.allSettled(
    products.map((p) => fetchStockLevel(p.id))
  )

  const productsWithStock: ProductWithStock[] = products.map((p, i) => ({
    ...p,
    stock: stockResults[i].status === "fulfilled" ? (stockResults[i] as PromiseFulfilledResult<StockLevelRead>).value : null,
  }))

  const lowStock = productsWithStock.filter(
    (p) => p.stock !== null && p.stock.quantity > 0 && p.stock.quantity <= p.min_stock
  )
  const outOfStock = productsWithStock.filter((p) => p.stock?.quantity === 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Inventario</h1>
        <p className="text-sm text-muted-foreground">Estado actual del stock de productos</p>
      </div>

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
            <TableHead>Actualizado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {productsWithStock.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                No hay productos registrados
              </TableCell>
            </TableRow>
          )}
          {productsWithStock.map((product) => {
            const status = getStockStatus(product)
            return (
              <TableRow key={product.id}>
                <TableCell>
                  <Avatar className="h-9 w-9 rounded-md">
                    <AvatarImage src={product.image_url ?? undefined} alt={product.name} />
                    <AvatarFallback className="rounded-md text-xs">
                      {product.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.category.name}</TableCell>
                <TableCell className="font-mono">{product.stock?.quantity ?? "—"}</TableCell>
                <TableCell className="font-mono">{product.min_stock}</TableCell>
                <TableCell>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {product.stock
                    ? new Date(product.stock.updated_at).toLocaleDateString("es-PE")
                    : "—"}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
