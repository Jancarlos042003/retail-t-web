import { notFound } from "next/navigation"
import { fetchProduct, fetchCategories } from "@/lib/api"
import { PageHeader } from "@/components/shared/page-header"
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
      <PageHeader title="Editar producto" description={product.name} />
      <ProductForm categories={categories} product={product} />
    </div>
  )
}
