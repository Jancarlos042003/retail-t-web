import Link from "next/link"
import { Add01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { fetchProducts } from "@/lib/api"
import { PageHeader } from "@/components/shared/page-header"
import { ProductTable } from "@/components/products/product-table"
import { Button } from "@/components/ui/button"

export default async function ProductosPage() {
  const products = await fetchProducts()

  return (
    <div className="space-y-5">
      <PageHeader
        title="Productos"
        description={`${products.length} productos registrados`}
        action={
          <Button asChild>
            <Link href="/productos/nuevo">
              <HugeiconsIcon icon={Add01Icon} size={16} className="mr-2" />
              Nuevo producto
            </Link>
          </Button>
        }
      />

      <ProductTable products={products} />
    </div>
  )
}
