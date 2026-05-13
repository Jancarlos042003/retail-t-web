import { fetchCategories } from "@/lib/api"
import { PageHeader } from "@/components/shared/page-header"
import { ProductForm } from "@/components/products/product-form"

export default async function NuevoProductoPage() {
  const categories = await fetchCategories().catch(() => [])

  return (
    <div className="space-y-5">
      <PageHeader title="Nuevo producto" description="Agrega un nuevo producto al catálogo" />
      <ProductForm categories={categories} />
    </div>
  )
}
