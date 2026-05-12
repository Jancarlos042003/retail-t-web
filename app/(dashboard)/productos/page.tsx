import Link from "next/link"
import { Add01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { fetchProducts } from "@/lib/api"
import { ProductTable } from "@/components/products/product-table"
import { Button } from "@/components/ui/button"

export default async function ProductosPage() {
  const products = await fetchProducts().catch(() => [])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Productos</h1>
          <p className="text-sm text-muted-foreground">{products.length} productos registrados</p>
        </div>
        <Button asChild>
          <Link href="/productos/nuevo">
            <HugeiconsIcon icon={Add01Icon} size={16} className="mr-2" />
            Nuevo producto
          </Link>
        </Button>
      </div>

      <ProductTable products={products} />
    </div>
  )
}
