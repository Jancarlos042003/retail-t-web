import { notFound } from "next/navigation"
import { fetchProduct, fetchCategories } from "@/lib/api"
import { ProductForm } from "@/components/products/product-form"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditarProductoPage({ params }: Props) {
  const { id } = await params

  const [product, categories] = await Promise.all([
    fetchProduct(id).catch(() => null),
    fetchCategories().catch(() => []),
  ])

  if (!product) notFound()

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Editar producto</h1>
        <p className="text-sm text-muted-foreground">{product.name}</p>
      </div>
      <ProductForm categories={categories} product={product} />
    </div>
  )
}
