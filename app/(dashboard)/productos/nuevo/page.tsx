import { fetchCategories } from "@/lib/api"
import { ProductForm } from "@/components/products/product-form"

export default async function NuevoProductoPage() {
  const categories = await fetchCategories().catch(() => [])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Nuevo producto</h1>
        <p className="text-sm text-muted-foreground">Agrega un nuevo producto al catálogo</p>
      </div>
      <ProductForm categories={categories} />
    </div>
  )
}
