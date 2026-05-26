import Link from "next/link"
import { Add01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { fetchCategories, fetchProductsPage } from "@/lib/api"
import { PRODUCTS_PAGE_SIZE } from "@/components/products/products-list.constants"
import { ProductsContainer } from "@/components/products/products-container"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"

export default async function ProductosPage() {
  const [productsPage, categories] = await Promise.all([
    fetchProductsPage({ limit: PRODUCTS_PAGE_SIZE, offset: 0, include_stock: true, include_price: true }),
    fetchCategories().catch(() => []),
  ])

  return (
    <div className="space-y-5">
      <PageHeader
        title="Productos"
        description={`${productsPage.total} productos registrados`}
        action={
          <Button asChild>
            <Link href="/productos/nuevo">
              <HugeiconsIcon icon={Add01Icon} size={16} className="mr-2" />
              Nuevo producto
            </Link>
          </Button>
        }
      />

      <ProductsContainer categories={categories} initialPage={productsPage} />
    </div>
  )
}
