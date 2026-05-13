import Link from "next/link"
import { notFound } from "next/navigation"
import { PencilEdit01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { fetchProduct, fetchCurrentPrice, fetchStockLevel } from "@/lib/api"
import { getStockStatus } from "@/lib/stock-utils"
import { formatDate } from "@/lib/utils"
import { ProductAvatar } from "@/components/shared/product-avatar"
import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface Props {
  params: Promise<{ id: string }>
}

export default async function ProductoDetailPage({ params }: Props) {
  const { id } = await params

  const product = await fetchProduct(id).catch(() => null)
  if (!product) notFound()

  const [price, stock] = await Promise.all([
    fetchCurrentPrice(id).catch(() => null),
    fetchStockLevel(id).catch(() => null),
  ])

  const stockStatus = getStockStatus(stock?.quantity ?? null, product.min_stock)

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title={product.name}
        description={product.category.name}
        action={
          <Button asChild>
            <Link href={`/productos/${id}/editar`}>
              <HugeiconsIcon icon={PencilEdit01Icon} size={16} className="mr-2" />
              Editar
            </Link>
          </Button>
        }
      />

      <div className="flex items-center gap-6">
        <ProductAvatar
          imageUrl={product.image_url}
          name={product.name}
          className="h-24 w-24 rounded-xl"
          fallbackClassName="rounded-xl text-2xl"
        />
        <div className="space-y-2">
          <Badge variant={product.is_active ? "default" : "secondary"}>
            {product.is_active ? "Activo" : "Inactivo"}
          </Badge>
          <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
        </div>
      </div>

      <Separator />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Código de barras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono font-semibold">{product.barcode}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Precio de venta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">
              {price ? `S/ ${parseFloat(price.selling_price).toFixed(2)}` : "Sin precio"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Stock actual</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{stock?.quantity ?? "—"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Stock mínimo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{product.min_stock}</p>
          </CardContent>
        </Card>
      </div>

      <div className="text-xs text-muted-foreground">
        Creado: {formatDate(product.created_at)} · Actualizado: {formatDate(product.updated_at)}
      </div>
    </div>
  )
}
