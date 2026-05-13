import { notFound } from "next/navigation"
import {
  fetchCategories,
  fetchCurrentPrice,
  fetchProduct,
  fetchStockLevel,
} from "@/lib/api"
import { ProductPriceForm } from "@/components/products/product-price-form"
import { PageHeader } from "@/components/shared/page-header"
import { ProductForm } from "@/components/products/product-form"
import { ProductStockMovementForm } from "@/components/products/product-stock-movement-form"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditarProductoPage({ params }: Props) {
  const { id } = await params

  const [product, categories, currentPrice, currentStock] = await Promise.all([
    fetchProduct(id).catch(() => null),
    fetchCategories().catch(() => []),
    fetchCurrentPrice(id).catch(() => null),
    fetchStockLevel(id).catch(() => null),
  ])

  if (!product) notFound()

  return (
    <div className="space-y-6">
      <PageHeader title="Editar producto" description={product.name} />

      <ProductForm categories={categories} product={product} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <ProductPriceForm
          productId={product.id}
          currentPrice={currentPrice?.selling_price ?? null}
        />
        <ProductStockMovementForm
          productId={product.id}
          currentStock={currentStock?.quantity ?? null}
        />
      </div>
    </div>
  )
}
